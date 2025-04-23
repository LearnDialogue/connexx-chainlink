import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import LoaderWheel from "../components/LoaderWheel";
import { EXCHANGE_STRAVA } from "../graphql/mutations/userMutations";

const RedirectPage = () => {
  const navigate = useNavigate();

  const token: string | null = localStorage.getItem("jwtToken");
  const queryParameters = new URLSearchParams(window.location.search);

  const scope = queryParameters.get("scope");
  const code = queryParameters.get("code");

  const [exchangeStrava] = useMutation(EXCHANGE_STRAVA, {
    onCompleted() {
      navigate("/app/profile");
    },
    onError(err) {
      navigate("/");
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
    <div className="landing-page-main-container">
      <LoaderWheel />
    </div>
  );
};

export default RedirectPage;
