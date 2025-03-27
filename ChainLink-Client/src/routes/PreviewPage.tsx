import { useEffect, useState } from 'react';
import PreviewEventModal from '../components/Preview';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_EVENT_PREVIEW } from '../graphql/queries/previewQueries';
import LoaderWheel from '../components/LoaderWheel';

const PreviewPage = () => {
    // useParams gets token from link
    const { token } = useParams();
    
    // calls query in previewQueries to fetch ride data (event and route details)
    const { loading, error, data } = useQuery(GET_EVENT_PREVIEW, {
        variables: { jwtToken: token }
    });
    
    if (loading) return <LoaderWheel />
    if (error) {
        console.error("Get event has failed");
    }

    const event = data?.getPreview.event;
    
    // console.log(token);
    // console.log(data);

    const handleModalClose = () => {
        
    };

  return (
    <div className='landing-page-main-container'>
        {event ? <PreviewEventModal event={event} onClose={ handleModalClose } /> : null}
    </div>
  );
};

export default PreviewPage;
