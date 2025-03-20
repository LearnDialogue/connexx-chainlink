import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from "@apollo/client/testing";
import FriendList from '../../src/components/FriendList';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../../src/graphql/queries/friendshipQueries';
import { ACCEPT_FRIEND, DECLINE_FRIEND, REMOVE_FRIEND } from '../../src/graphql/mutations/friendshipMutations';
import { FETCH_USER_BY_NAME } from '../../src/graphql/queries/userQueries';

