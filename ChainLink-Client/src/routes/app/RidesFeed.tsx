import { useContext, useEffect, useState } from 'react';
import { InMemoryCache, gql, useMutation, useQuery } from '@apollo/client';
import { RideFeedCardProps } from '../../components/RideFeedCard';
import { AuthContext } from '../../context/auth';

import RideFeedCard from '../../components/RideFeedCard';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';

import '../../styles/rides-feed.css';
import EventModal from '../../components/EventModal';
import { formatDistance } from '../../util/Formatters';
import Footer from '../../components/Footer';

const RidesFeed = () => {
  const { user } = useContext(AuthContext);
  const [reload, setReload] = useState<boolean | null>(null);
  const [searchName, setSearchName] = useState('');
  const [radius, setRadius] = useState(0);
  const [bikeType, setBikeType] = useState<string[] | never[]>([]);
  const [wkg, setWkg] = useState<string[] | never[]>([]);
  const [match, setMatch] = useState(['']);

  const [sortingOrder, setSortingOrder] = useState<string>('date_asc');
  const [sortedRideData, setSortedRideData] = useState<any>([]);

  const [event, setEvent] = useState<any | null>(null);
  const [eventParams, setEventParams] = useState({
    startDate: new Date().toISOString(),
  });

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  const { data: userData } = useQuery(FETCH_USER_QUERY, {
    onCompleted() {
      setSearchName(userData.getUser.locationName);
      setRadius(userData.getUser.radius);
    },
    variables: {
      username: user?.username,
    },
  });

  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, id } = event.target;

    if (id == 'bike') {
      if (checked) {
        setBikeType((prevArray) => [...prevArray, name]);
      } else {
        setBikeType((prevArray) => prevArray.filter((item) => item !== name));
      }
    } else if (id == 'wkg') {
      if (checked) {
        setWkg((prevArray) => [...prevArray, name]);
      } else {
        setWkg((prevArray) => prevArray.filter((item) => item !== name));
      }
    }

    setAppliedFilters((prev) => {
      if (checked) {
        return [...prev, name];
      } else {
        return prev.filter((filter) => filter !== name);
      }
    });
  };

  const handleSliderChange = (event: any) => {
    const newRadius = event.target.value;
    setRadius(parseInt(newRadius));
  };

  const token: string | null = localStorage.getItem('jwtToken');

  const {
    data: rideData,
    loading: rideLoading,
    refetch: ridesRefetch,
  } = useQuery(FETCH_RIDES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: eventParams,
  });

  const handleSubmit = async () => {
    setEventParams((prevVals) => ({
      ...prevVals,
      location: searchName.trim().toLowerCase(),
      radius: radius,
      bikeType: bikeType,
      wkg: wkg,
    }));

    await setReload((prevReload) => !prevReload);
  };

  useEffect(() => {
    if (reload !== null) {
      ridesRefetch();
    }
  }, [reload]);

  function calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const toRadians = (degrees: number): number => {
      return degrees * (Math.PI / 180);
    };

    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const radiusOfEarthKm = 6371;

    const distance = radiusOfEarthKm * c * 1.61; // miles
    return distance;
  }

  useEffect(() => {
    if (rideData && rideData.getEvents && userData && userData.getUser) {
      let sortedRides = [...rideData.getEvents]; // Create a copy to avoid mutating the original state

      // Sort Order
      if (sortingOrder === 'date_asc') {
        sortedRides.sort(
          (a, b) =>
            Number(new Date(a.startTime)) - Number(new Date(b.startTime))
        );
      } else if (sortingOrder === 'date_desc') {
        sortedRides.sort(
          (a, b) =>
            Number(new Date(b.startTime)) - Number(new Date(a.startTime))
        );
      } else if (sortingOrder == 'wpkg_asc') {
        sortedRides.sort(
          (a, b) =>
            Number(b.difficulty.slice(-3)) - Number(a.difficulty.slice(-3))
        );
      } else if (sortingOrder == 'wpkg_desc') {
        sortedRides.sort(
          (a, b) =>
            Number(a.difficulty.slice(-3)) - Number(b.difficulty.slice(-3))
        );
      } /* else if (sortingOrder === "match-asc") {
                sortedRides.sort((a, b) => a.match - b.match);
            } else if (sortingOrder === "match-desc") {
                sortedRides.sort((a, b) => b.match - a.match);
            }*/ else if (sortingOrder === 'distance-desc') {
        sortedRides.sort((a, b) => {
          const distanceA = calculateDistance(
            userData.getUser.locationCoords,
            a.locationCoords
          );
          const distanceB = calculateDistance(
            userData.getUser.locationCoords,
            b.locationCoords
          );
          return distanceA - distanceB;
        });
      } else if (sortingOrder === 'distance-asc') {
        sortedRides.sort((a, b) => {
          const distanceA = calculateDistance(
            userData.getUser.locationCoords,
            a.locationCoords
          );
          const distanceB = calculateDistance(
            userData.getUser.locationCoords,
            b.locationCoords
          );
          return distanceB - distanceA;
        });
      }

      setSortedRideData(sortedRides);
    }
  }, [rideData, sortingOrder]); // Re-run this effect when either rideData or sortingOrder changes

  return (
    <>
      <Navbar />

      {event ? <EventModal event={event} setEvent={handleModalClose} /> : <></>}

      <div className='rides-feed-main-container'>
        <div className='rides-feed-grid'>
          <div className='rides-feed-filters'>
            <h4>Apply filters</h4>

            <div className='rides-feed-filter-options disable-filter-options'>
              <h5>Match</h5>
              <label htmlFor='great-match'>
                <input
                  disabled
                  name='great match'
                  onChange={handleCheckboxChange}
                  id='great-match'
                  type='checkbox'
                />
                <div>
                  <span>Great match</span>
                  <i className='fa-solid fa-circle-check'></i>
                </div>
              </label>
              <label htmlFor='good-match'>
                <input
                  disabled
                  name='good match'
                  onChange={handleCheckboxChange}
                  id='good-match'
                  type='checkbox'
                />
                <div>
                  <span>Good match</span>
                  <i className='fa-solid fa-circle-minus'></i>
                </div>
              </label>
              <label htmlFor='poor-match'>
                <input
                  disabled
                  name='poor match'
                  onChange={handleCheckboxChange}
                  id='poor-match'
                  type='checkbox'
                />
                <div>
                  <span>Poor match</span>
                  <i className='fa-solid fa-circle-xmark'></i>
                </div>
              </label>
            </div>

            <div className='rides-feed-filter-options'>
              <h5>Bike type</h5>
              <label htmlFor='mountain-bike'>
                <input
                  name='Mountain'
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Mountain
              </label>
              <label htmlFor='road-bike'>
                <input
                  name='Road'
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Road
              </label>
              <label htmlFor='hybrid-bike'>
                <input
                  name='Hybrid'
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Hybrid
              </label>
              <label htmlFor='touring-bike'>
                <input
                  name='Touring'
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Touring
              </label>
              <label htmlFor='gravel-bike'>
                <input
                  name='Gravel'
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Gravel
              </label>
            </div>

            <div className='rides-feed-filter-options'>
              <h5>Watts/kg range</h5>
              <label htmlFor='wkg-range-1'>
                <input
                  name='Above 4.5'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                Above 4.5
              </label>
              <label htmlFor='wkg-range-2'>
                <input
                  name='4.1 to 4.5'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                4.1 to 4.5
              </label>
              <label htmlFor='wkg-range-3'>
                <input
                  name='3.8 to 4.1'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                3.8 to 4.1
              </label>
              <label htmlFor='wkg-range-4'>
                <input
                  name='3.5 to 3.8'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                3.5 to 3.8
              </label>
              <label htmlFor='wkg-range-5'>
                <input
                  name='3.2 to 3.5'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                3.2 to 3.5
              </label>
              <label htmlFor='wkg-range-6'>
                <input
                  name='2.9 to 3.2'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                2.9 to 3.2
              </label>
              <label htmlFor='wkg-range-7'>
                <input
                  name='2.6 to 2.9'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                2.6 to 2.9
              </label>
              <label htmlFor='wkg-range-8'>
                <input
                  name='2.3 to 2.6'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                2.3 to 2.6
              </label>
              <label htmlFor='wkg-range-9'>
                <input
                  name='2.0 to 2.3'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                2.0 to 2.3
              </label>
              <label htmlFor='wkg-range-10'>
                <input
                  name='Below 2.0'
                  onChange={handleCheckboxChange}
                  id='wkg'
                  type='checkbox'
                />
                Below 2.0
              </label>
            </div>

            <div className='rides-feed-filter-options'>
              <h5>Search Region</h5>

              <div className='geolocation-radius-filter'>
                <label>Location:</label>
                <input
                  onChange={(e) => {
                    setSearchName(e.target.value);
                  }}
                  type='text'
                  pattern='[0-9]{5}'
                  title='Five digit zip code'
                  value={searchName}
                />
              </div>

              <label htmlFor=''>
                Range:
                <input
                  type='range'
                  min='1'
                  max='100'
                  value={radius}
                  onChange={handleSliderChange}
                />{' '}
                {radius} mi
              </label>
            </div>

            <div className='rides-feed-filter-search'>
              <Button onClick={handleSubmit} type='primary'>
                Search
              </Button>
            </div>

            <div className='rides-feed-filters-applied'>
              {appliedFilters.map((filter, index) => (
                <div key={index}>{filter}</div> // Using index as key because filter values might not be unique
              ))}
            </div>
          </div>

          <div className='rides-feed-results'>
            <div className='rides-feed-header'>
              {rideData ? (
                <h4>Showing {rideData.getEvents.length} rides:</h4>
              ) : (
                <></>
              )}
              <div className='sort-rides'>
                <span>Sort by: </span>
                <select
                  value={sortingOrder}
                  onChange={(e) => setSortingOrder(e.target.value)}
                >
                  <option value=''>-- Select option --</option>
                  <option value='date_asc'>Date: Soonest to Furthest</option>
                  <option value='date_desc'>Date: Furthest to Soonest</option>
                  <option value='wpkg_asc'>Watts per kg: High to Low</option>
                  <option value='wpkg_desc'>Watts per kg: Low to High</option>
                  <option value='distance-asc'>
                    Distance from Me: Far to Near
                  </option>
                  <option value='distance-desc'>
                    Distance from Me: Near to Far
                  </option>
                  <option disabled value='match-asc'>
                    Match: Best to Worst
                  </option>
                  <option disabled value='match-desc'>
                    Match: Worst to Best
                  </option>
                </select>
              </div>
            </div>

            <div className='rides-feed-rides'>
              {rideLoading ? (
                <p>Loading...</p>
              ) : rideData && sortedRideData ? (
                sortedRideData.map((event: RideFeedCardProps) => {
                  return (
                    <RideFeedCard
                      key={event._id}
                      _id={event._id}
                      event={event}
                      setEvent={handleModalClose}
                    />
                  );
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

const FETCH_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      id
      locationName
      locationCoords
      radius
      sex
    }
  }
`;

export const FETCH_RIDES = gql`
  query getEvents(
    $page: Int
    $pageSize: Int
    $startDate: Date!
    $endDate: Date
    $bikeType: [String!]
    $wkg: [String!]
    $location: String
    $radius: Int
    $match: [String]
  ) {
    getEvents(
      getEventsInput: {
        page: $page
        pageSize: $pageSize
        startDate: $startDate
        endDate: $endDate
        bikeType: $bikeType
        wkg: $wkg
        location: $location
        radius: $radius
        match: $match
      }
    ) {
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
      privateWomen
      privateNonBinary
      match
    }
  }
`;

export default RidesFeed;
