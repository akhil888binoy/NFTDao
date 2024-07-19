import { useEffect, useState } from "react";
import useProposalById from "./useProposalById";

const useAllProposals = (
  numOfProposalsInDAO,
  CryptoDevsDAOAddress,
  CryptoDevsDAOABI
) => {
  const [proposals, setProposals] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      const proposalsArray = [];
      const errorsArray = [];

      for (let i = 0; i < numOfProposalsInDAO; i++) {
        const { proposal, error } = useProposalById(
          i,
          CryptoDevsDAOAddress,
          CryptoDevsDAOABI
        );

        if (error) {
          console.error(error);
          errorsArray.push(error);
        } else if (proposal) {
          proposalsArray.push(proposal);
        }
      }

      setProposals(proposalsArray);
      setErrors(errorsArray);
      setIsLoading(false);
    };

    fetchProposals();
  }, [numOfProposalsInDAO, CryptoDevsDAOAddress, CryptoDevsDAOABI]);

  return { proposals, errors, isLoading };
};

export default useAllProposals;
