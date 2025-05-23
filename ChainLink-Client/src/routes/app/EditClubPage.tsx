import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { AuthContext } from '../../context/auth';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import '../../styles/edit-club.css';

import { GET_CLUB } from '../../graphql/queries/clubQueries';
import {
  UPDATE_CLUB,
  DELETE_CLUB,
  ADD_OWNER,
  REMOVE_OWNER,
} from '../../graphql/mutations/clubMutations';

const EditClubPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // form state
  const { data, loading } = useQuery(GET_CLUB, { variables: { id } });
  const club = data?.getClub;
  const members = club?.members || [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setPrivate] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // initialize form
  useEffect(() => {
    if (club) {
      setName(club.name);
      setDescription(club.description || '');
      setPrivate(club.isPrivate);
      const isCurrentOwner = club.owners.some((o: any) => o.id === user?.id);
      setNewOwnerId(isCurrentOwner ? user!.id : club.owners[0]?.id);
    }
  }, [club, user]);

  const [updateClub] = useMutation(UPDATE_CLUB, {
    onCompleted: () => navigate(`/app/club/${id}`),
    onError: err => alert('Save failed: ' + err.message),
  });
  const [deleteClub] = useMutation(DELETE_CLUB, {
    onCompleted: () => navigate('/app/profile'),
    onError: err => alert('Delete failed: ' + err.message),
  });
  const [addOwner] = useMutation(ADD_OWNER);
  const [removeOwner] = useMutation(REMOVE_OWNER);

  // core submit logic
  const performSave = async () => {
    if (!club) return;
    // 1) update club fields
    await updateClub({
      variables: {
        id,
        clubInput: {
          name,
          description,
          isPrivate,
          createdAt: club.createdAt,
          owners: club.owners.map((o: any) => o.id),
          locationName: club.locationName,
          locationCoords: club.locationCoords,
          radius: club.radius,
          metric: club.metric ?? true,
        },
      },
    });
    // 2) transfer ownership if changed
    const currentOwnerId = club.owners[0].id;
    if (newOwnerId && newOwnerId !== currentOwnerId) {
      await addOwner({ variables: { clubId: id, userId: newOwnerId } });
      await removeOwner({ variables: { clubId: id, userId: user!.id } });
    }
  };

  const handleSaveClick = () => {
    if (!hasChanges) return navigate(`/app/club/${id}`);
    const currentOwnerId = club?.owners[0].id;
    if (newOwnerId && newOwnerId !== currentOwnerId) {
      setShowTransferModal(true);
    } else {
      performSave();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="editclub-main-container">
      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="delete-club-modal">
          <div className="delete-club-container">
            <h2>Are you sure you want to delete this club?</h2>
            <div className="modal-actions">
              <Button
                color="red"
                onClick={() => deleteClub({ variables: { id } })}
                type="primary"
              >
                Delete Club
              </Button>
              <Button onClick={() => setShowDeleteModal(false)} type="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Confirmation */}
      {showTransferModal && (
        <div className="delete-club-modal">
          <div className="delete-club-container">
            <h2>Confirm Ownership Transfer</h2>
            <p>Are you sure you want to transfer ownership to <b>{members.find(m => m.id === newOwnerId)?.username}</b>?</p>
            <div className="modal-actions">
              <Button
                color="primary"
                onClick={() => { performSave(); setShowTransferModal(false); }}
                type="primary"
              >
                Confirm & Save
              </Button>
              <Button
                onClick={() => setShowTransferModal(false)}
                type="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="editclub-form-container">
        <h2>Edit Club</h2>

        <div className="editclub-form-input">
          <label>Club Name</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setHasChanges(true); }}
          />
        </div>

        <div className="editclub-form-input">
          <label>Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => { setDescription(e.target.value); setHasChanges(true); }}
          />
        </div>

        <div className="editclub-form-input checkbox-input">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => { setPrivate(e.target.checked); setHasChanges(true); }}
            />{' '}
            Make Club Private
          </label>
        </div>

        <div className="editclub-form-input">
          <label>Transfer Ownership</label>
          <select
            value={newOwnerId || ''}
            onChange={e => { setNewOwnerId(e.target.value); setHasChanges(true); }}
          >
            {members.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.username}
              </option>
            ))}
          </select>
        </div>

        <div className="editclub-actions">
          <Button onClick={handleSaveClick} type="primary">
            {hasChanges ? 'Save Changes' : 'Exit'}
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            type="warning"
            marginLeft={12}
          >
            Delete Club
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditClubPage;
