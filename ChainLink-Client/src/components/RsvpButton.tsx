import React, { useState } from 'react';
import "../styles/components/button.css"
import { gql, useMutation } from '@apollo/client';
import { GET_JOINED_EVENTS } from '../routes/app/ProfilePage';
import { FETCH_RIDES } from '../routes/app/RidesFeed';

interface RsvpButtonProps {
    isJoined: boolean | "" | undefined;
    eventID: string,
    type: 'primary' | 'secondary';
    disabled?: boolean;
    width?: number;
    setJoinedStatus: (status: boolean) => void;
}

const RsvpButton: React.FC<RsvpButtonProps> = ({ isJoined, eventID, type, width, disabled, setJoinedStatus }) => {
    let disabledStyle = (disabled ? " button-disabled" : "");

    const token: string | null = localStorage.getItem("jwtToken");
    const [handleRSVP] = useMutation(JOIN_RIDE, {
        context: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        update(cache, { data: { joinEvent } }) {
            const joinedEvents : any = cache.readQuery({query: GET_JOINED_EVENTS});
            if (joinedEvents) {
                cache.writeQuery({
                    query: GET_JOINED_EVENTS,
                    data: {
                        getJoinedEvents: {
                            ...joinedEvents,
                            joinEvent
                        }
                    }
                });
            }
        },
        variables: { eventID: eventID }
    });

    const [handleLeave] = useMutation(LEAVE_RIDE, {
        context: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        update(cache, { data: { leaveEvent } }) {
            const joinedEvents : any = cache.readQuery({query: GET_JOINED_EVENTS});
            if (joinedEvents) {
                const updatedEvents = joinedEvents.getJoinedEvents.filter((event: { _id: any; }) => event._id !== leaveEvent._id);
                cache.writeQuery({
                    query: GET_JOINED_EVENTS,
                    data: {
                        getJoinedEvents: updatedEvents
                    }
                });
            }

        },
        variables: { eventID: eventID }
    });

    const handleRSVPClick = () => {
        setJoinedStatus(true);
        handleRSVP({variables: { eventID: eventID }});
    };

    const handleLeaveClick = () => {
        setJoinedStatus(false);
        handleLeave({variables: { eventID: eventID }});
    };

    return (
        <div style={{ width: '100%' }} >
            {isJoined ? (
                <button onClick={handleLeaveClick} className={"button button-" + type + disabledStyle} style={{width: `${width ?? 100}%`}} >
                Leave Ride
                </button>
            ) : (
                <button onClick={handleRSVPClick} className={"button button-" + type + disabledStyle} style={{width: `${width ?? 100}%`}} >
                RSVP
                </button>
            )}
        </div>
    );
};

const JOIN_RIDE = gql`
    mutation joinEvent($eventID: String!) {
        joinEvent(eventID: $eventID) {
            _id
            host
            name
            locationName
            locationCoords
            startTime
            description
            bikeType
            difficulty
            wattsPerKilo
            intensity
            route
            participants
        }
    }
`

const LEAVE_RIDE = gql`
    mutation leaveEvent($eventID: String!) {
        leaveEvent(eventID: $eventID) {
            _id
            host
            name
            locationName
            locationCoords
            startTime
            description
            bikeType
            difficulty
            wattsPerKilo
            intensity
            route
            participants
        }
    }
`

export default RsvpButton;
