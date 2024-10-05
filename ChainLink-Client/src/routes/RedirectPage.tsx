import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import LoaderWheel from '../components/LoaderWheel';

const RedirectPage = () => {
  const navigate = useNavigate();

  const token: string | null = localStorage.getItem('jwtToken');
  const queryParameters = new URLSearchParams(window.location.search);

  const scope = queryParameters.get('scope');
  const code = queryParameters.get('code');

  const [exchangeStrava] = useMutation(EXCHANGE_STRAVA, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted() {
      navigate('/app/profile');
    },
    onError(err) {
      console.log(err);
      navigate('/');
    },
  });

  useEffect(() => {
    if (code && scope) {
      exchangeStrava({
        variables: { code, scope },
      });
    }
  }, [code, scope, exchangeStrava]);

  return (
    <div className='landing-page-main-container'>
      <LoaderWheel />
    </div>
  );
};

const EXCHANGE_STRAVA = gql`
  mutation exchangeStravaAuthorizationCode($code: String!, $scope: String!) {
    exchangeStravaAuthorizationCode(code: $code, scope: $scope) {
      username
    }
  }
`;

export default RedirectPage;
