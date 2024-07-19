import { useReadContract } from "wagmi"; // Adjust the import as needed
import { CryptoDevsDAOABI, CryptoDevsDAOAddress } from "@/constants";
const useFetchProposalById = (id) => {
  const { data: proposal, error } = useReadContract({
    address: CryptoDevsDAOAddress,
    abi: CryptoDevsDAOABI,
    functionName: "proposals",
    args: [id],
  });

  if (error) {
    console.error(error);
    window.alert(error);
    return null;
  }

  if (proposal) {
    const [nftTokenId, deadline, yayVotes, nayVotes, executed] = proposal;
    return {
      proposalId: id,
      nftTokenId: nftTokenId.toString(),
      deadline: new Date(parseInt(deadline.toString()) * 1000),
      yayVotes: yayVotes.toString(),
      nayVotes: nayVotes.toString(),
      executed: Boolean(executed),
    };
  }

  return null;
};
export default useFetchProposalById;
