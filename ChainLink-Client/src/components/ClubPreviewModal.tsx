import React, { useContext, useState } from "react";
import { AuthContext } from "../context/auth";
import "../styles/components/club-preview-modal.css";
import Avatar from "react-avatar";
import RideList from "./RideList";
import { GET_INVITED_EVENTS } from '../graphql/queries/eventQueries';
import { useQuery } from '@apollo/client';


interface ClubPreviewModalProps {
  club: any | null;
  setClub: (nullClub: string | null) => void;
  isMember: boolean | false;
  isPending: boolean | false;
}

const ClubPreviewModal: React.FC<ClubPreviewModalProps> = ({club, setClub, isMember, isPending}) => {
    const { user } = useContext(AuthContext);
    const [currDate] = useState<Date>(new Date());
    const [event, setEvent] = useState<any | null>(null);
    const { data: invitedData } = useQuery(GET_INVITED_EVENTS, { variables: { userId: club.clubUser.id } });
    
    const invitedEvents = invitedData?.getInvitedEvents || [];
    const upcomingInvited = invitedEvents.filter((e: any) => new Date(e.startTime) > currDate);


    if(!club) return null;


  return <div className="club-modal-container">
        <div className="club-card-modal-overlay">
          <div className="club-modal-header">
            <h3>{club.name}</h3>
            <span className="club-card-close-modal" onClick={() => setClub(null)}>
              <i className="fa fa-times"></i>
            </span>
          </div>
            <div className="club-card-body">  
            {(!club.isPrivate || isMember)
            ?  <div className="row gap-1">
                <Avatar name={club.name.charAt(0)} size="60" round={true} />
                <div className="col gap-1 description-section"> 
                  <div className="row gap-1">
                    <i className="fa fa-info-circle"></i>
                    {club.description}
                  </div>
                  <div className ="row gap-1">
                    <i className="fa fa-map-marker"></i>
                    {club.locationName}
                  </div>
                </div> 
                <div className="col">
                  {isMember ? <div className="badge-green">Member</div> : <div className="badge-red">Not a Member</div>} 
                </div>
              </div> : 
              <div className="row gap-1">
                <Avatar name={club.name.charAt(0)} size="60" round={true} />
                <div>
                  Private Club - Join to see details
                </div>   
                <div className="col">
                  {(isPending && !isMember) ? <div className="badge-yellow">Pending</div> : <div className="badge-green">Not a Member</div>}
                </div>          
              </div>
            }
              <div className="row gap-1 w-100">
                  <RideList
                    title="Upcoming Rides"
                    events={invitedEvents}
                    onSelectEvent={setEvent}
                    currDate={currDate}
                    showPast={false}
                  />
              </div>         
            </div>    
        </div>
    </div>;
}
export default ClubPreviewModal;