import { ethers, utils } from "ethers";
import { create } from "ipfs-http-client";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { useMutation } from "react-query";
import {
  SurveyAnswersData,
  SurveyQuestionsData,
} from "../../components/Survey";
import { SURVEY_ADDRESS } from "../contract/config";
import { addAnswerToSurvey, addSurvey } from "../mutations";
import { useWalletContext } from "./walletContext";

type ipfsContextType = {
  isPushingData: boolean;
  isPullingData: boolean;
  pushQuestionsToIPFSForConnected: Function;
  pushAnswersToIPFSForConnected: Function;
  pushQuestionsToIPFSForInbuilt: Function;
  pushAnswersToIPFSForInbuilt: Function;
  pullData: Function;
};

interface ProviderProps {
  children: ReactNode;
}

interface EncodeQuestionData {
  surveyTitle: string;
  description: string;
  dateCreated: string;
  dateExpiration: string;
  questions: SurveyQuestionsData[];
}

interface EncodeAnswerData {
  user: {
    username: string;
    email: string;
  };
  surveyId: number;
  answers: SurveyAnswersData[];
}

export function IPFSProvider({ children }: ProviderProps) {
  const [{ token }] = useCookies(["token"]);
  const [isPushingData, setIsPushingData] = useState<boolean>(false);
  const [isPullingData, setIsPullingData] = useState<boolean>(false);
  const [pushReturnData, setPushReturnData] = useState<object>();
  const { surveyContract, tokenContract, address, inBuiltAddress } =
    useWalletContext();

  const { push } = useRouter();

  // useMutations
  const addSurveyMutation = useMutation(addSurvey, {
    onSuccess({ data, success, message }) {
      if (success) {
        push("/home/"); //Go home after adding survey
      }
    },
    onError(err) {
      console.error(err);
    },
  });
  const addAnswerMutation = useMutation(addAnswerToSurvey, {
    onSuccess({ data, success, message }) {
      if (success) {
        push("/home/"); //Go home after adding survey
      }
    },
    onError(err) {
      console.error(err);
    },
  });

  const pushQuestionsToIPFSForConnected = async (
    json: EncodeQuestionData,
    surveyData: any
  ) => {
    try {
      console.log(
        json,
        process.env.IPFS_PROJEC_ID,
        process.env.IPFS_URL,
        process.env.IPFS_PROJECT_SECRET
      );
      const userAddress = address;
      setIsPushingData(true);
      const ipfsClient = create({
        url: `${process.env.IPFS_URL}/api/v0`,
        headers: {
          authorization: `Bearer ${process.env.IPFS_PROJEC_ID}:${process.env.IPFS_PROJECT_SECRET}`,
        },
      });
      const cid = await ipfsClient.dag.put(json as object, {
        storeCodec: "dag-cbor",
        hashAlg: "sha2-256",
      });
      // const { cid, path } = await ipfsClient.add('json');
      console.log(cid.toString(), "CID after IPFS call");

      // Now call survey contract and add cid to it
      // FIrst apporve spend for the survey contract
      const approvedSpendAmount = surveyData?.amount;
      // const estimatedGas = await tokenContract.estimateGas.approve(
      //   SURVEY_ADDRESS,
      //   approvedSpendAmount
      // );

      /* Now call the enroll for survey contract function */
      // const esmG = await surveyContract.estimateGas.enrollForSurvey(
      //   cid.toString(),
      //   address,
      //   surveyData?.surveyPlanId,
      //   surveyData?.numOfValidators,
      //   surveyData?.numberOfCommissioners,
      //   approvedSpendAmount
      // );
      const gasPrice = utils.formatUnits(
        await ethers.getDefaultProvider().getGasPrice(),
        "ether"
      );
      // console.log(
      //   estimatedGas,
      //   "Gas price",
      //   gasPrice,
      //   "Survey enroll gas",
      //   esmG
      // );
      const approveTx = await tokenContract.approve(
        SURVEY_ADDRESS,
        approvedSpendAmount,
        {
          gasPrice: utils.parseUnits("100", "gwei"),
          gasLimit: 1000000,
        }
      );
      const approveReceipt = approveTx.wait();
      console.log(approveTx, approveReceipt, "BSC sonergy approve spend");

      /* Now call enroll function */
      const enrollTx = await surveyContract.enrollForSurvey(
        cid.toString(),
        address,
        surveyData?.surveyPlanId,
        surveyData?.numOfValidators,
        surveyData?.numberOfCommissioners,
        approvedSpendAmount,
        {
          gasPrice: utils.parseUnits("100", "gwei"),
          gasLimit: 1000000,
        }
      );

      const enrollReceipt = await enrollTx.wait();
      console.log(enrollTx, enrollReceipt, "Survey contract enroll survey");

      // Listen for survey enroll event and get returned data
      surveyContract.on(
        "SurveyItemCreated",
        (
          surveyURI: string,
          address: string,
          surveyID: number,
          planID: number,
          numOfValidators: number,
          numOfcommisioners: number,
          numOfresponse: number,
          amount: number,
          nftStatus: boolean,
          exist: boolean,
          completed: boolean
        ) => {
          // Resolve address to match users
          console.log(
            surveyURI,
            address,
            surveyID,
            planID,
            numOfValidators,
            numOfcommisioners,
            numOfresponse,
            amount,
            nftStatus,
            exist,
            completed,
            "Returned event data"
          );

          if (userAddress === address) {
            setIsPushingData(false);
          }
        }
      );
    } catch (err) {
      console.error("An error occurred", err);
      setIsPushingData(false);
    }
  };
  const pushQuestionsToIPFSForInbuilt = async (
    json: EncodeQuestionData,
    surveyData: any
  ) => {
    try {
      console.log(
        json,
        process.env.IPFS_PROJEC_ID,
        process.env.IPFS_URL,
        process.env.IPFS_PROJECT_SECRET
      );
      const userAddress = address;
      setIsPushingData(true);
      const ipfsClient = create({
        url: `${process.env.IPFS_URL}/api/v0`,
        headers: {
          authorization: `Bearer ${process.env.IPFS_PROJEC_ID}:${process.env.IPFS_PROJECT_SECRET}`,
        },
      });
      const cid = await ipfsClient.dag.put(json as object, {
        storeCodec: "dag-cbor",
        hashAlg: "sha2-256",
      });
      // const { cid, path } = await ipfsClient.add('json');
      console.log(cid.toString(), "CID after IPFS call");

      // Now call add survey mutate function
      await addSurveyMutation.mutateAsync({
        token,
        surveyURI: `https://ipfs.infura.io/ipfs/${cid}`,
        address: inBuiltAddress,
        surveyPlanId: surveyData?.surveyPlanId as string,
        numOfValidators: surveyData?.numOfValidators,
        numberOfCommissioners: surveyData?.numberOfCommissioners,
        amount: surveyData?.amount,
      });
      setIsPushingData(false);
    } catch (err) {
      console.error("An error occurred", err);
      setIsPushingData(false);
    }
  };

  const pushAnswersToIPFSForConnected = async (
    json: EncodeAnswerData,
    surveyID: any
  ) => {
    try {
      console.log(
        json,
        process.env.IPFS_PROJEC_ID,
        process.env.IPFS_URL,
        process.env.IPFS_PROJECT_SECRET
      );
      const userAddress = address;
      setIsPushingData(true);
      const ipfsClient = create({
        url: `${process.env.IPFS_URL}/api/v0`,
        headers: {
          authorization: `Bearer ${process.env.IPFS_PROJEC_ID}:${process.env.IPFS_PROJECT_SECRET}`,
        },
      });
      const cid = await ipfsClient.dag.put(json as object, {
        storeCodec: "dag-cbor",
        hashAlg: "sha2-256",
      });
      console.log(cid.toString(), "CID after IPFS answer push");

      // Now call survey contract and add cid to it

      /* Now call enroll function */
      const answerTx = await surveyContract.provideAnswers(
        surveyID,
        cid.toString(),
        {
          gasPrice: utils.parseUnits("100", "gwei"),
          gasLimit: 1000000,
        }
      );

      const answerReceipt = await answerTx.wait();
      console.log(answerTx, answerReceipt, "Survey contract ProvideAnswer");

      // Listen for survey enroll event and get returned data
      surveyContract.on(
        "AnswerCreated",
        (
          surveyURI: string,
          provider: string,
          validator: string,
          surveyID: number,
          answerID: number,
          isValidated: boolean,
          isValid: boolean
        ) => {
          // Resolve address to match users
          console.log(
            surveyURI,
            provider,
            validator,
            surveyID,
            answerID,
            isValidated,
            isValid,
            "Returned event data of provide answer contract call"
          );

          if (userAddress === address) {
            setIsPushingData(false);
          }
        }
      );
    } catch (err) {
      console.error("An error occurred", err);
      setIsPushingData(false);
    }
  };
  const pushAnswersToIPFSForInbuilt = async (
    json: EncodeAnswerData,
    surveyID: any
  ) => {
    try {
      const userAddress = address;
      setIsPushingData(true);
      const ipfsClient = create({
        url: `${process.env.IPFS_URL}/api/v0`,
        headers: {
          authorization: `Bearer ${process.env.IPFS_PROJEC_ID}:${process.env.IPFS_PROJECT_SECRET}`,
        },
      });
      const cid = await ipfsClient.dag.put(json as object, {
        storeCodec: "dag-cbor",
        hashAlg: "sha2-256",
      });
      console.log(cid.toString(), "CID after IPFS answer push");

      // Now call add survey answers mutate function
      await addAnswerMutation.mutateAsync({
        token,
        surveyId: surveyID,
        address: inBuiltAddress,
        answerUri: `https://ipfs.infura.io/ipfs/${cid}`,
      });
    } catch (err) {
      console.error("An error occurred", err);
      setIsPushingData(false);
    }
  };

  const pullData = async (ipfsUri: string) => {
    // console.log(cid, "CID", CID.parse(cid));
    setIsPullingData(true);
    const ipfsClient = create({
      url: `${process.env.IPFS_URL}/api/v0`,
      headers: {
        authorization: `Bearer ${process.env.IPFS_PROJEC_ID}:${process.env.IPFS_PROJECT_SECRET}`,
      },
    });
    // const json = ipfsClient.get(`/ipfs/${cid}`);
    const json = await fetch(
      ipfsUri.includes("https")
        ? ipfsUri
        : `https://ipfs.infura.io/ipfs/${ipfsUri}`
    ).then((res) => res.json());
    // const { value } = await ipfsClient.dag.get(CID.parse(cid));
    // const jsonString = new TextDecoder("utf-8").decode(json.value.Data);
    console.log(
      json,
      // json.value,
      // jsonString,
      // JSON.parse(jsonString),
      "JSON after IPFS call"
    );
    setIsPullingData(false);
    return json;
  };

  return (
    <>
      <IPFSContext.Provider
        value={{
          isPushingData,
          isPullingData,
          pushQuestionsToIPFSForConnected,
          pushAnswersToIPFSForConnected,
          pushQuestionsToIPFSForInbuilt,
          pushAnswersToIPFSForInbuilt,
          pullData,
        }}
      >
        {children}
      </IPFSContext.Provider>
    </>
  );
}

export function useIPFSContext() {
  return useContext(IPFSContext);
}

const IPFSContext = createContext<ipfsContextType>(undefined);
