import { useRouter } from "next/router";
import { AiFillClockCircle, AiFillLeftCircle } from "react-icons/ai";
import { FaEye, FaWallet } from "react-icons/fa";
import { GoVerified } from "react-icons/go";
import { ButtonPrimary } from "../../../components/Button";
import withLayout from "../../../components/Layout";
import { useModal } from "../../../components/Modal";
import OnboardCard from "../../../components/OnboardCard";

function SingleSurvey() {
  const router = useRouter();
  const { sid, action } = router.query;
  console.log(sid, action, "Query params");

  const [bidModal, BidModal] = useModal();

  return (
    <div className="w-full">
      <div className="flex flex-col items-start justify-center w-full bg-white p-3 mb-3">
        <div
          className="flex items-center justify-start space-x-2 hover:cursor-pointer"
          onClick={(e) => router.back()}
        >
          <AiFillLeftCircle />
          <span className="text-sm font-medium text-gray-800">Marketplace</span>
        </div>
      </div>
      {action === "bid" && (
        <div className="flex flex-col items-start justify-start w-full bg-transparent p-3 mb-2">
          <OnboardCard>
            <div className="w-full flex flex-col items-center justify-center">
              <span className="w-full flex items-center justify-start text-xs font-light mb-5">
                <AiFillClockCircle size={14} /> Sale ends May 24, 2022 at 6:30am
                GMT+1
              </span>
              <span className="w-full flex items-center justify-between text-xs font-light mb-5">
                <span>
                  Current owner: <b className="text-primary">Username</b>
                </span>
                <span className="flex items-center justify-center">
                  <FaEye size={14} className="mr-2 text-gray-500" /> 450 views
                </span>
              </span>
              <span className="w-full flex items-center justify-start text-sm text-gray-400 font-light mb-5">
                Top bid:{" "}
                <b className="font-medium text-lg text-gray-700 mx-2">
                  650 SNEGY
                </b>{" "}
                ($2,145.60)
              </span>
            </div>
            <div className="flex flex-col items-start justify-between mb-2">
              <span className="text-gray-700 text-xs font-light flex items-center justify-center mb-2">
                <div className="w-4 h-4 rounded-full bg-primary mr-1"></div>{" "}
                Username <GoVerified color="#0059AC" className="ml-2" />
              </span>
              <span className="text-gray-700 text-sm font-normal text-left">
                Blockchain development and utilization in sub-saharan Africa.
              </span>
            </div>
            <ButtonPrimary
              text="Place bid"
              type="normal"
              icon={<FaWallet color="white" />}
              iconPosition={"left"}
              block={true}
              onClick={(e) => {
                console.log("Place bid on survey clicked", e);
                bidModal.show({
                  title: "Place bid",
                  content: <PlaceBidModalContent />,
                });
              }}
              disabled={false}
              isLoading={false}
            />
          </OnboardCard>
        </div>
      )}
      {action === "buy" && (
        <div className="flex flex-col items-start justify-start w-full bg-transparent p-3 mb-2">
          <OnboardCard>
            <div className="w-full flex flex-col items-center justify-center">
              {/* <span className="w-full flex items-center justify-start text-xs font-light mb-5">
                <AiFillClockCircle size={14} /> Sale ends May 24, 2022 at 6:30am
                GMT+1
              </span> */}
              <span className="w-full flex items-center justify-between text-xs font-light mb-5">
                <span>
                  Current owner: <b className="text-primary">Username</b>
                </span>
                <span className="flex items-center justify-center">
                  <FaEye size={14} className="mr-2 text-gray-500" /> 50 views
                </span>
              </span>
              <span className="w-full flex items-center justify-start text-sm text-gray-400 font-light mb-5">
                Top bid:{" "}
                <b className="font-medium text-lg text-gray-700 mx-2">
                  650 SNEGY
                </b>{" "}
                ($2,145.60)
              </span>
            </div>
            <div className="flex flex-col items-start justify-between mb-2">
              <span className="text-gray-700 text-xs font-light flex items-center justify-center mb-2">
                <div className="w-4 h-4 rounded-full bg-primary mr-1"></div>{" "}
                Username <GoVerified color="#0059AC" className="ml-2" />
              </span>
              <span className="text-gray-700 text-sm font-normal text-left">
                Blockchain development and utilization in sub-saharan Africa.
              </span>
            </div>
            <ButtonPrimary
              text="Confirm & buy"
              type="normal"
              icon={<FaWallet color="white" />}
              iconPosition={"left"}
              block={true}
              onClick={(e) => {
                console.log("confirm buy on survey clicked", e);
                bidModal.show({
                  title: "Place bid",
                  content: <PlaceBidModalContent />,
                });
              }}
              disabled={false}
              isLoading={false}
            />
          </OnboardCard>
        </div>
      )}
      <BidModal />
    </div>
  );
}

const PlaceBidModalContent = () => (
  <div className="w-full flex flex-col space-y-2">
    <div className="form-control mb-2">
      <label className="label">
        <span className="label-text text-slate-700 font-medium">Price</span>
      </label>
      <label className="input-group border-gray-200 border-solid border-[1px] rounded-md">
        <span className="flex items-center justify-center text-gray-700 px-4 bg-slate-100">
          SNEGY
        </span>
        <input
          type="number"
          placeholder="0.00"
          className="input input-bordered bg-transparent text-black outline-none border-none after:ring-0 before:ring-0 before:ring-offset-0 after:ring-offset-0 w-[100%]"
        />
        {/* <span className="flex items-center justify-center px-4 text-primary bg-transparent">
                MAX
              </span> */}
      </label>
      <label className="label">
        <span className="label-text-alt text-xs text-gray-500 mb-1">
          = $2.400.40
        </span>
        <span className="label-text-alt text-xs text-gray-500 mb-1">
          <b>Available:</b> 0.0000 <b>SNEGY</b>
        </span>
      </label>
    </div>
    <ButtonPrimary
      text="Confirm bid"
      type="normal"
      icon={null}
      iconPosition={null}
      block={true}
      onClick={(e) => console.log("confirm bid clicked", e)}
      isLoading={false}
      disabled={false}
    />
  </div>
);

export default withLayout(SingleSurvey);
