"use client";

import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
// import useProposalById from "@/hooks/useProposalById";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";

import {
  readContract,
  // waitForTransactionReceipt,
  // writeContract,
} from "wagmi/actions";

import styles from "./page.module.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  // Check if the user's wallet is connected, and its address using Wagmi's hooks.
  const { address, isConnected } = useAccount();
  // State variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);
  const { data: hash, writeContract } = useWriteContract();
  // const { waitForTransactionReceipt } = useWaitForTransactionReceipt();
  // State variable to show the loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);
  const [Id, setId] = useState(0);
  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  // State variable to store all proposals in the DAO
  const [proposals, setProposals] = useState([]);
  // State variable to switch between the 'Create Proposal' and 'View Proposals' tabs
  const [selectedTab, setSelectedTab] = useState("");

  // Fetch the owner of the DAO
  const { data: daoOwner } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: "owner",
  });
  console.log("DAO owner = ", daoOwner);
  // Fetch the balance of the DAO
  const { data: daoBalance } = useBalance({
    address: CryptoDevsDAOAddress,
  });
  console.log("DAO balance = ", daoBalance);

  // Fetch the number of proposals in the DAO
  const { data: numOfProposalsInDAO } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: "numProposals",
  });
  const numOfProposals = Number(numOfProposalsInDAO); // Convert BigInt to Number

  console.log("numOfProposalsInDAO =", numOfProposals);

  // Fetch the CryptoDevs NFT balance of the user
  const { data: nftBalanceOfUser } = useReadContract({
    abi: CryptoDevsNFTABI,
    address: CryptoDevsNFTAddress,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("nftBalanceOfUser =", Number(nftBalanceOfUser));

  async function createProposal() {
    setLoading(true);
    if (!isConnected) {
      window.alert("Please connect your wallet to create a proposal.");
      setLoading(false);
      return;
    }
    console.log("passed isConnected");
    console.log("isConnected", isConnected);
    try {
      console.log("inside try block of createProposal");
      await writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "createProposal",
        args: [fakeNftTokenId],
      });
      console.log("contract written");
    } catch (error) {
      console.error(error);
      window.alert(error);
    }

    setLoading(false);
  }

  // Function to fetch a proposal by it's ID
  const { data: proposal } = useReadContract({
    address: CryptoDevsDAOAddress,
    abi: CryptoDevsDAOABI,
    functionName: "proposals",
    args: [0],
  });
  async function fetchProposalById(id) {
    try {
      const [nftTokenId, deadline, yayVotes, nayVotes, executed] = proposal;

      const parsedProposal = {
        proposalId: id,
        nftTokenId: nftTokenId.toString(),
        deadline: new Date(parseInt(deadline.toString()) * 1000),
        yayVotes: yayVotes.toString(),
        nayVotes: nayVotes.toString(),
        executed: Boolean(executed),
      };

      return parsedProposal;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }
  // Function to fetch all proposals in the DAO
  async function fetchAllProposals() {
    try {
      const proposals = [];
      const numOfProposals = Number(numOfProposalsInDAO); // Convert BigInt to Number

      for (let i = 0; i < numOfProposals; i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
        setId(i);
        console.log("Id", Id);
      }
      setProposals(proposals);
      return proposals;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }
  console.log("proposals", proposals);
  // Function to vote YAY or NAY on a proposal
  async function voteForProposal(proposalId, vote) {
    setLoading(true);
    try {
      await writeContract({
        account: "0xb604c4c69836D92f4a68e2FF9C1e813a06D5D9D2",
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "voteOnProposal",
        args: [proposalId, vote === "YAY" ? 0 : 1],
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to execute a proposal after the deadline has been exceeded
  async function executeProposal(proposalId) {
    setLoading(true);
    try {
      await writeContract({
        account: "0xb604c4c69836D92f4a68e2FF9C1e813a06D5D9D2",
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "executeProposal",
        args: [proposalId],
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to withdraw ether from the DAO contract
  async function withdrawDAOEther() {
    setLoading(true);
    try {
      await writeContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "withdrawEther",
        args: [],
      });
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // async function createProposal() {
  //   setLoading(true);
  //   if (!isConnected) {
  //     window.alert("Please connect your wallet to create a proposal.");
  //     setLoading(false);
  //     return;
  //   }
  //   writeContract({
  //     address: CryptoDevsDAOAddress,
  //     abi: CryptoDevsDAOABI,
  //     functionName: "createProposal",
  //     args: [fakeNftTokenId],
  //   }); // Use await to wait for the write function
  //   console.log("contract written");
  //   setLoading(false);
  // }
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  console.log("isConfirmed", isConfirmed);

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalanceOfUser === 0n) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.card}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  // Piece of code that runs every time the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when the user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>
    );

  return (
    <div className={inter.className}>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance:{" "}
            {nftBalanceOfUser ? nftBalanceOfUser.toString() : "0"}
            <br />
            {daoBalance && (
              <>
                Treasury Balance: {formatEther(daoBalance.value).toString()} ETH
              </>
            )}
            <br />
            Total Number of Proposals:{" "}
            {numOfProposalsInDAO ? numOfProposalsInDAO.toString() : "0"}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("View Proposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {address && address.toLowerCase() === daoOwner?.toLowerCase() ? (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        Address Logged in : {address}
        DAOOwner : {daoOwner}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {hash && <div> Transaction Hash: {hash}</div>}
      </div>
    </div>
  );
}
