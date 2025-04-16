import { Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import ConnectWithStrava from '../assets/btn_strava_connectwith_light.png';
import { useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import LoaderWheel from '../components/LoaderWheel';
import Button from '../components/Button';
import { REQUEST_STRAVA } from '../graphql/mutations/userMutations';

const ConnectToStravaPage = () => {
  const token: string | null = localStorage.getItem('jwtToken');
  const [stravaURL, setStravaURL] = useState('');

  const location = useLocation();
  const redirect = location.state?.redirect;
  console.log(redirect)

  // strava query
  const [
    requestStravaAuthorization,
    { loading: stravaLoading, error: stravaErr, data: stravaData },
  ] = useLazyQuery(REQUEST_STRAVA, {
    onCompleted() {
      setStravaURL(stravaData.requestStravaAuthorization);
    },
    onError: (error) => {
      console.error('GraphQL Mutation Error:', error);
    },
  });

  useEffect(() => {
    requestStravaAuthorization();
  }, [requestStravaAuthorization]);

  return (
    <div>
      <div className='signup-main-container'>
        <div className='signup-form-container'>
          <h1 className='signup-form-brand'>
            <Link to='/'>Connexx ChainLink</Link>
          </h1>
          {stravaLoading && (
            <Button type='transparent' disabled>
              <LoaderWheel />
            </Button>
          )}
          {stravaErr && <div>Error: {stravaErr.message}</div>}
          {stravaData && (
            <div>
              <a className='button button-transparent' href={stravaURL}>
                <img src={ConnectWithStrava} />
              </a>
            </div>
          )}
          <span className='signup-strava-account-warning'>
            * A <span className='strava'>Strava</span> account is required.
          </span>
          <span className='signup-strava-account-warning'>
            Don't have one? &nbsp;{' '}
            <Link
              className='strava'
              target='_blank'
              to='https://www.strava.com/register/free'
            >
              Create one here.
            </Link>
            <br />
          </span>
        </div>
      </div>
      <Footer absolute />
    </div>
  );
};

export default ConnectToStravaPage;
