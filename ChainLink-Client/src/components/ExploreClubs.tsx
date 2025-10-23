// ExploreClubs.tsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/auth";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import "../styles/components/explore-clubs.css";
import {JOIN_CLUB, LEAVE_CLUB, REQUEST_TO_JOIN} from "../graphql/mutations/clubMutations";
import { GET_CLUBS, GET_CLUB_MEMBERSHIPS, GET_PENDING_CLUB_REQUESTS } from "../graphql/queries/clubQueries";
import {FETCH_USER_BY_NAME} from "../graphql/queries/userQueries";
import ClubPreviewModal from "./ClubPreviewModal";


const ExploreClubs = () => {
  const [receiver, setReceiver] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  //   const [clubList, setClubList] = useState<string[]>([]);
  const { user } = useContext(AuthContext);
  const sender = user?.username || "";
  const [club, setClub] = useState<any | null>(null);


  const [joinPublicClub] = useMutation(JOIN_CLUB);
  const [requestJoinPrivateClub] = useMutation(REQUEST_TO_JOIN);
  const [leaveClub] = useMutation(LEAVE_CLUB)

  var {data: getUser} = useQuery(FETCH_USER_BY_NAME, {
    variables: { username: user?.username },
    skip: !user?.username,
    fetchPolicy: "network-only",
  })

  var {data: allClubs} = useQuery(GET_CLUBS);

  var { data: clubMemberships, refetch: refetchMemberships } = useQuery(GET_CLUB_MEMBERSHIPS, {
    variables: {
      username: user?.username,
    },
    skip: !user?.username,
    fetchPolicy: "network-only",
  });

  var {data: pendingClubRequests, refetch: refetchPending} = useQuery(GET_PENDING_CLUB_REQUESTS, {
    variables: {
      username: user?.username,
    },
    skip: !user?.username,
    fetchPolicy: "network-only",
  });

  const sendJoinRequest = (clubname: string) => {
    requestJoinPrivateClub({
      variables: { clubId: clubname, userId: getUser.getUser.id },
    }).then(() => {
      toast.success("Join request sent!");
      refetchPending();

    })
    .catch(error => {
      console.error('Error sending request to join club:', error);
      toast.error("Error sending request to join club: " + error.message);
    });
  };

  const handleJoinClub = (clubname: string) => {
    joinPublicClub({
        variables: { clubId: clubname, userId: getUser.getUser.id },
    })
    .then(() => {
      toast.success("Joined club!");
      refetchMemberships();
    })
    .catch(error => {
      console.error('Error joining club:', error);
      toast.error("Error joining club: " + error.message);
    });
  }
    

  const handleLeaveClub = (clubname: string) => {
    leaveClub({
      variables: { clubId: clubname, userId: getUser.getUser.id  },
    }).then(() => {
      if(clubMemberships.getClubMemberships.find((c: any) => c.id === clubname)){
        toast.success("Left club.");
      }else{
        toast.success("Join request cancelled.");
      }
      refetchMemberships();
      refetchPending();
    })
    .catch(error => {
      console.error('Error leaving club:', error);
      toast.error("Error leaving club: " + error.message);
    }); 
  };

    //accept & decline pending club invite?

  //filter clubs to search based on input
  useEffect(() => {
    setSuggestions(allClubs.getClubs);
  if (receiver) {
    if ( allClubs && !allClubs.getClubs.some((u: any) =>
        u.name.toLowerCase().includes(receiver.toLowerCase())
      )
    ) {
      // If no  match, set suggestions to all clubs
      setSuggestions(allClubs.getClubs);
    } else {
        //filter by search
        var filtered = allClubs.getClubs.filter((u: any) =>
            u.name.toLowerCase().includes(receiver.toLowerCase())
        );
      setSuggestions(filtered);
    }
  }
  }, [receiver, allClubs]);

// useEffect(() => {
//   if (receiver && clubMemberships?.getClubMemberships) {
//     const filtered = clubMemberships?.getClubMemberships.filter((f: any) =>
//       f.otherUser.toLowerCase().includes(receiver.toLowerCase())
//     );
//     if (filtered.length != 0) {
//       setSuggestions(filtered);
//     } else {
//     setSuggestions([]);
//     }
//   }
// }, [friendStatusesData, receiver]);

  const handleSendRequest = (club: string) => {
    //if public club, join directly
    //if private club, send join request

    //get club, check privacy

    var clubObj = allClubs.getClubs.find((c: any) => c.id === club);
    if(!clubObj){
        toast.error("Club not found.");
        return;
    }
    try{
        if (clubObj.isPrivate === false) {
            handleJoinClub(clubObj.id);
            } else {
                sendJoinRequest(clubObj.id);
            }        
    }catch(error){
        toast.warn("Error joining club.");
    }
  };

  return (
    <div className="club-request-container">
      {club && <ClubPreviewModal club={club} setClub={setClub} 
      isMember = {clubMemberships.getClubMemberships.find( (c: any) => c.id === club.id)} 
      isPending = {pendingClubRequests?.getPendingClubRequests?.find((c: any) => c.id === club.id)}/>}
      <div className="club-request-form-container">
        <h2>Explore Clubs</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search club name..."
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="club-request-input"
          />
          {suggestions.length > 0 && (
            <div className="club-request-suggestions">
              {suggestions.map((club: any) => {
              // Find the membership status each this club
              const membership = clubMemberships?.getClubMemberships?.find(
                (c: any) => c.id === club.id
              );
              const pending = pendingClubRequests?.getPendingClubRequests?.find(
                (c: any) => c.id === club.id
              );
              // If the user is already a member or has a pending request, don't show the join button
              
              return (
                <div key={club.id} className="club-request-card-button-container">
                  <div onClick={() => setClub(club)} className="club-card">
                    {club.name}
                  </div>
                
                  {membership ? (
                    <button 
                      onClick={() => handleLeaveClub(club.id)} 
                      className="club-request-button remove"
                    >
                      Leave Club
                    </button>
                  ) : pending ? (
                    <button 
                      onClick={() => handleLeaveClub(club.id)} 
                      className="club-request-button pending"
                    >
                     Pending
                    </button>
                  ) : club.isPrivate ? (
                    <button 
                      onClick={() => handleSendRequest(club.id)} 
                      className="club-request-button"
                    >
                      Request to Join
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSendRequest(club.id)} 
                      className="club-request-button"
                    >
                      Join Club
                    </button>
                  )}
                </div>
              );
            })}         
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default ExploreClubs;
