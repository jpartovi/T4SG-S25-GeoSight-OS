import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";

// Material-UI imports
import SaveAsIcon from '@mui/icons-material/SaveAs';
import TextField from "@mui/material/TextField";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// Component imports
import {
  EditIcon,
  StarOffIcon,
  StarOnIcon
} from "../../../../components/Icons";
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";
import CustomPopover from "../../../../components/CustomPopover";
import { PluginChild } from "../../MapLibre/Plugin";
import { ProjectCheckpoint } from "../../../../components/ProjectCheckpoint";

// Utility imports
import { DjangoRequests, fetchingData } from "../../../../Requests";
import { Actions } from '../../../../store/dashboard';
import { EmbedConfig } from "../../../../utils/embed";

import './style.scss';

// Bookmark component
export default function Bookmark({ map }) {
  // Refs
  const projectCheckpointRef = useRef(null);

  // State
  const [projectCheckpointEnable, setProjectCheckpointEnable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState(null);
  const [saveBookmarkID, setSaveBookmarkID] = useState(null);

  // Redux
  const dispatch = useDispatch();
  const isEmbed = EmbedConfig().id;
  const { id, slug } = useSelector(state => state.dashboard.data);
  const selectedBookmark = useSelector(state => state.selectedBookmark);

  // Update dashboard data with new bookmark
  const updateDashboardData = (bookmark) => {
    projectCheckpointRef.current.applyData(bookmark);
  };

  // Fetch bookmark list
  const fetchBookmarks = () => {
    setBookmarks(null);
    fetchingData(
      `/api/dashboard/${slug}/bookmarks`,
      {},
      {},
      (data) => {
        setBookmarks(data);
      },
      false
    );
  };

  // Change selected bookmark when there is embed config
  useEffect(() => {
    fetchBookmarks();
    if (map && id) {
      const defaultBookmark = EmbedConfig().bookmark;
      if (defaultBookmark) {
        dispatch(Actions.SelectedBookmark.change(defaultBookmark));
        updateDashboardData(defaultBookmark);
      }
    }
  }, [map, id]);

  const selectedBookmarkChanged = (selectedBookmark) => {
    if (bookmarks !== null) {
      const bookmark = bookmarks.find(row => row.id === selectedBookmark.id);
      if (selectedBookmark.position) {
        updateDashboardData(selectedBookmark);
      } else if (bookmark) {
        updateDashboardData(bookmark);
      }
    } else if (selectedBookmark.position) {
      updateDashboardData(selectedBookmark);
    }
  };

  // Update dashboard data when selected bookmark updated
  useEffect(() => {
    selectedBookmarkChanged(selectedBookmark);
  }, [selectedBookmark]);

  // Save function based on url
  const save = async (url) => {
    setUploading(true);
    const data = projectCheckpointRef.current.getData();
    try {
      const response = await DjangoRequests.post(url, { ...data, name: name });
      fetchBookmarks();
      setOpen(false);
      setUploading(false);
      dispatch(Actions.SelectedBookmark.change({ ...response.data }));
    } catch (err) {
      setError(err.toString());
      setUploading(false);
    }
  };

  // On save as data
  const onSaveAs = () => {
    save(`/api/dashboard/${slug}/bookmarks/create`);
  };

  // On save data
  const onSave = (id) => {
    save(`/api/dashboard/${slug}/bookmarks/${id}`);
  };

  const bookmarkSave = bookmarks ? bookmarks.find(
    row => row.id === saveBookmarkID
  ) : null;

  if (!id) {
    return null;
  }

  return (
    <>
      <ProjectCheckpoint
        map={map}
        setProjectCheckpointEnable={setProjectCheckpointEnable}
        ref={projectCheckpointRef}
      />
      <CustomPopover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        Button={
          <div className='Active'>
            <PluginChild title={'Bookmark'}>
              <a>
                <StarOffIcon />
              </a>
            </PluginChild>
          </div>
        }
      >
        {/* LIST OF BOOKMARKS */}
        <div className='BookmarkComponent'>
          {!isEmbed && (
            <div className='Header'>
              <ThemeButton
                variant="primary-text"
                onClick={() => {
                  setSaveBookmarkID(null);
                  setOpen(true);
                  setName('');
                }}
              >
                <SaveAsIcon /> Save As...
              </ThemeButton>
            </div>
          )}

          <div className='Body'>
            <table>
              <tbody>
                {bookmarks === null ? (
                  <tr>
                    <td>Loading</td>
                  </tr>
                ) : (
                  <Fragment>
                    {bookmarks.map(bookmark => (
                      <tr
                        key={bookmark.id}
                        className={'Bookmark ' + (bookmark.id === selectedBookmark.id ? 'Selected' : '')}
                        onClick={() => {
                          dispatch(Actions.SelectedBookmark.change(bookmark));
                        }}
                      >
                        <td>
                          <StarOnIcon className='StarIcon' />
                        </td>
                        <td>
                          <div>{bookmark.name}</div>
                        </td>
                        {!isEmbed && bookmark.id && (user.is_staff || user.username === bookmark.creator) ? (
                          <Fragment>
                            <td>
                              <EditIcon
                                className='EditIcon'
                                onClick={(e) => {
                                  setSaveBookmarkID(bookmark.id);
                                  setOpen(true);
                                  setName(bookmark.name);
                                  e.stopPropagation();
                                }}
                              />
                              <HighlightOffIcon
                                className='DeleteIcon'
                                onClick={(e) => {
                                  if (confirm(`Are you sure you want to delete ${bookmark.name}?`)) {
                                    $.ajax({
                                      url: `/api/dashboard/${slug}/bookmarks/${bookmark.id}`,
                                      method: 'DELETE',
                                      success: function () {
                                        if (selectedBookmark.id === bookmark.id) {
                                          dispatch(
                                            Actions.SelectedBookmark.change({
                                              id: 0,
                                              name: 'Default'
                                            })
                                          );
                                        }
                                        fetchBookmarks();
                                      },
                                      beforeSend: beforeAjaxSend
                                    });
                                    e.stopPropagation();
                                  }
                                  e.stopPropagation();
                                }}
                              />
                            </td>
                          </Fragment>
                        ) : (
                          <td />
                        )}
                      </tr>
                    ))}
                  </Fragment>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CustomPopover>

      {/* SAVE MODAL */}
      <Modal
        open={open}
        onClosed={() => {
          setOpen(false);
        }}
      >
        <ModalHeader
          onClosed={() => {
            setOpen(false);
          }}
        >
          {bookmarkSave ? (
            <Fragment>
              {`Save bookmark ${bookmarkSave.name}`}
            </Fragment>
          ) : (
            'Save bookmark'
          )}
        </ModalHeader>
        <ModalContent>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error !== ''}
            helperText={error}
          />
        </ModalContent>
        <ModalFooter>
          <SaveButton
            onClick={bookmarkSave ? () => onSave(bookmarkSave.id) : onSaveAs}
            loading={uploading}
          />
        </ModalFooter>
      </Modal>
    </>
  );
}
