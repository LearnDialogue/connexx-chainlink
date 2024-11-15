const featureFlags = {
  friendsFeatureEnabled: import.meta.env.DEV,
  profilePicturesEnabled: true,
  rideInvitesEnabled: import.meta.env.DEV,
  privateRidesEnabled: import.meta.env.DEV,
  privateProfilesEnabled: true,
  notificationsEnabled: import.meta.env.DEV,
  // Add other flags here
  // some other flag when we release it:
  // nameFeatureEnabled: true,
};

export default featureFlags;

// usage:
// import file in component, then use it to conditionally render components like so:
// {featureFlags.nameFeatureEnabled && <FeatureComponent />}