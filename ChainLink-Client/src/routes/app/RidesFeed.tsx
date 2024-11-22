import { useContext, useEffect, useState } from 'react';
import { InMemoryCache, useQuery } from '@apollo/client';
import { RideFeedCardProps } from '../../components/RideFeedCard';
import { AuthContext } from '../../context/auth';

import RideFeedCard from '../../components/RideFeedCard';
import Button from '../../components/Button';

import '../../styles/rides-feed.css';
import EventModal from '../../components/EventModal';
import { formatDistance } from '../../util/Formatters';
import Footer from '../../components/Footer';
import { FETCH_USER_BY_NAME } from '../../graphql/queries/userQueries';
import { FETCH_RIDES } from '../../graphql/queries/eventQueries';
import MultirangedSlider from '../../components/MultirangedSlider';

const RidesFeed = () => {
  const { user } = useContext(AuthContext);
  const [reload, setReload] = useState<boolean | null>(null);
  const [searchName, setSearchName] = useState('');
  const [radius, setRadius] = useState(0);
  const [bikeType, setBikeType] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<number[]>([.5, 7]);
  const [match, setMatch] = useState(['']);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  const [sortingOrder, setSortingOrder] = useState<string>('date_asc');
  const [sortedRideData, setSortedRideData] = useState<any>([]);

  const [event, setEvent] = useState<any | null>(null);
  const [eventParams, setEventParams] = useState({
    startDate: new Date().toISOString(),
    location: '',
    radius: 0,
    bikeType: [] as string[],
    difficulty: [.5, 7],
  });

  const handleModalClose = (nullEvent: any | null) => {
    setEvent(nullEvent);
  };

  const { data: userData } = useQuery(FETCH_USER_BY_NAME, {
    onCompleted() {
      setSearchName(userData.getUser.locationName);
      setRadius(userData.getUser.radius);
      setBikeType(userData.getUser.bikeTypes);
      setAppliedFilters(userData.getUser.bikeTypes);
      setEventParams((prevVals) => ({
        ...prevVals,
        location: userData.getUser.locationName,
        radius: userData.getUser.radius,
        bikeType: userData.getUser.bikeTypes,
      }));
    },
    variables: {
      username: user?.username,
    },
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, id } = event.target;
    let newBikeFilter: string[] = [...bikeType];

    if (id == 'bike') {
      if (checked && !newBikeFilter.includes(name)) {
        newBikeFilter.push(name);
        setBikeType(newBikeFilter);
      } else if (!checked && newBikeFilter.includes(name)){
        newBikeFilter = newBikeFilter.filter((item) => item !== name);
        setBikeType(newBikeFilter);
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

  const handledifficultySliderChange = (values: number[]) => {
    setDifficulty(values);
  };

  const handleRadiusSliderChange = (event: any) => {
    const newRadius = event.target.value;
    setRadius(parseInt(newRadius));
  };

  const token: string | null = localStorage.getItem('jwtToken');

  const {
    data: rideData,
    loading: rideLoading,
    refetch: ridesRefetch,
  } = useQuery(FETCH_RIDES, {
    variables: eventParams,
    skip: !userData,
  });

  const handleSubmit = async () => {
    setEventParams((prevVals) => ({
      ...prevVals,
      location: searchName.trim().toLowerCase(),
      radius: radius,
      bikeType: bikeType,
      difficulty: difficulty,
    }));

    await ridesRefetch();
  };

  useEffect(() => {
    if (reload !== null) {
      ridesRefetch();
    }
  }, [reload]);

  //Fixes blank cancelled search query
  useEffect(() => {
    if (userData) {
      ridesRefetch();
    }
  }, [eventParams, userData]);


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
                  checked={bikeType.includes('Mountain')}
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Mountain
              </label>
              <label htmlFor='road-bike'>
                <input
                  name='Road'
                  checked={bikeType.includes('Road')}
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Road
              </label>
              <label htmlFor='hybrid-bike'>
                <input
                  name='Hybrid'
                  checked={bikeType.includes('Hybrid')}
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Hybrid
              </label>
              <label htmlFor='touring-bike'>
                <input
                  name='Touring'
                  checked={bikeType.includes('Touring')}
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Touring
              </label>
              <label htmlFor='gravel-bike'>
                <input
                  name='Gravel'
                  checked={bikeType.includes('Gravel')}
                  onChange={handleCheckboxChange}
                  id='bike'
                  type='checkbox'
                />{' '}
                Gravel
              </label>
            </div>

            <div className='rides-feed-filter-options'>
              <h5>Watts/kg range</h5>
              <MultirangedSlider
              defaultValues={eventParams.difficulty}
              onChange={handledifficultySliderChange}
            />
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
                  onChange={handleRadiusSliderChange}
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

export default RidesFeed;
