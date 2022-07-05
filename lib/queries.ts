const BASE_URL = 'https://sonergy.herokuapp.com';


export const getUserProfile = async (token: string) => await fetch(`${BASE_URL}/user`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }).then(res => res.json());
export const fetchUserWalletAddresses = async (token: string) => await fetch(`${BASE_URL}/wallet/fetch-wallet`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }).then(res => res.json());
