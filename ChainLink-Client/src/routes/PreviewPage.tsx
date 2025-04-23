import { useEffect, useState, useContext } from 'react';
import PreviewEventModal from '../components/Preview';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_EVENT_PREVIEW } from '../graphql/queries/previewQueries';
import LoaderWheel from '../components/LoaderWheel';
import { AuthContext } from '../context/auth';


const PreviewPage = () => {
    // useParams gets token from link
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    const [event, setEvent] = useState< any | null>(null);
    
    const handleModalClose = (nullEvent: any | null) => {
      setEvent(nullEvent);
    };
    // calls query in previewQueries to fetch ride data (event and route details)
    const { loading, error, data } = useQuery(GET_EVENT_PREVIEW, {
      variables: { jwtToken: token }
    });
    
    // if user is logged in, automatically navigates to rides feed page
    useEffect(() => {
      if (user) {
        navigate('/app/rides/' + token);
      }
    }, [user, navigate]);

    useEffect(() => {
      if (data) {
        setEvent(data.getPreview.event);
      }
    }, [data]); 

    const route = data?.getPreview?.route;

  return (
    <div className="landing-page-main-container">
      {event && route && (
        <PreviewEventModal
          event={event}
          route={route}
          onClose={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default PreviewPage;
