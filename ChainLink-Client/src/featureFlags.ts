const environment = import.meta.env.VITE_ENVIRONMENT || "dev";

const featureFlags = {
  friendsFeatureEnabled: environment === "dev",
  // Add other flags here
};

export default featureFlags;

// usage:
// import file in component, then use it to conditionally render components like so:
// {featureFlags.nameFeatureEnabled && <FeatureComponent />}