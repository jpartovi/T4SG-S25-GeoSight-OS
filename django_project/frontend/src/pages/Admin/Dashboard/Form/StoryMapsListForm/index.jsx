/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AddButton } from "../../../../../components/Elements/Button";
import { SortableTree } from "../../../../../components/SortableTreeForm/index";
import {
  dataStructureToTreeData,
  findAllGroups,
  updateGroupInStructure
} from "../../../../../components/SortableTreeForm/utilities";
import { dictDeepCopy } from "../../../../../utils/main";
import './style.scss';
import Modal, { ModalContent, ModalHeader } from '../../../../../components/Modal';

const groupDefault = {
  group: '',
  children: []
};

/**
 * StoryMapsForm is a simplified form to organize StorySlides into StoryMaps (groups).
 * It provides UI to add/remove groups, assign slides to groups, and rearrange slides.
 */
export default function StoryMapsListForm({
  pageName = 'Story Maps',
  data = [],
  dataStructure = { children: [] },
  setDataStructure = () => {},
  removeSlideAction = () => {},
  updateSlideAction = () => {},
  addSlideToMapAction = () => {},
  editSlideInMapAction = () => {},
  otherSlideActions = () => {}
}) {
  const className = pageName.replaceAll(' ', '');
  const singularPageName = 'Story Slide';

  const [treeData2, setTreeData] = useState(null);

  const [newSlideModalOpen, setNewSlideModalOpen] = useState(false);
  const [newSlideGroupId, setNewSlideGroupId] = useState(null);
  const [newSlideFields, setNewSlideFields] = useState({
    title: '',
    description: '',
    checkpointTitle: ''
  });

  // Convert structure to tree format when data or structure changes
  useEffect(() => {
    const excludedTypes = new Set([
      'MultiIndicatorType',
      'SingleIndicatorType',
      'DynamicIndicatorType',
      'RelatedTableLayerType'
    ]);

    const filteredData = data.filter(item => !excludedTypes.has(item?.type));
    const tree = dataStructureToTreeData(filteredData, dataStructure);
    setTreeData(tree);
  }, [data, dataStructure]);

  // Add missing UUIDs to structure if not present
  useEffect(() => {
    if (!dataStructure) return;
    
    const assignUuids = (structure) => {
      if (!structure) return;
      if (!structure.id) structure.id = uuidv4();
      if (structure.children && Array.isArray(structure.children)) {
        structure.children.forEach(child => {
          if (typeof child === 'object' && child !== null) {
            assignUuids(child);
          }
        });
      }
    };

    assignUuids(dataStructure);
    setDataStructure({ ...dataStructure });
  }, [dataStructure, setDataStructure]);

  /** Add a new StoryMap (group) */
  const addGroup = () => {
    let allGroups = findAllGroups(treeData2);
    let idx = allGroups.length + 1;
    let groupName = '';
    let created = false;

    while (!created && idx < 100) {
      groupName = 'Story Map ' + idx;
      const exists = allGroups.find(g => g.name === groupName);
      if (!exists) {
        dataStructure.children.unshift({
          ...dictDeepCopy(groupDefault),
          group: groupName
        });
        setDataStructure({ ...dataStructure });
        created = true;
      }
      idx++;
    }
  };

  /** Recursively remove all slides from a group */
  const removeSlidesInGroup = (group) => {
    group.children.forEach(child => {
      if (typeof child === 'object') {
        removeSlidesInGroup(child);
      } else {
        const slide = data.find(row => row.id === child);
        if (slide) removeSlideAction(slide);
      }
    });
  };

  /** Remove a StoryMap (group) */
  const removeGroup = (groupName) => {
    updateGroupInStructure(groupName, dataStructure, (data, structure) => {
      const index = structure.children.indexOf(data);
      if (index > -1) {
        structure.children.splice(index, 1);
        setDataStructure({ ...dataStructure });
        removeSlidesInGroup(data);
      }
    });
  };

  /** Handle reordering or updates */
  const rearrangeTree = (newStructure) => {
    setDataStructure({ ...newStructure });
  };

  /** Add a slide to a specific StoryMap */
  const addLayerInGroup = (mapId) => {
    setNewSlideGroupId(mapId);
    setNewSlideModalOpen(true);
  };

  return (
    <Fragment>
      <Modal open={newSlideModalOpen} onClosed={() => setNewSlideModalOpen(false)}>
        <ModalHeader onClosed={() => setNewSlideModalOpen(false)}>
          Add New Slide
        </ModalHeader>
        <ModalContent>
          <input
            placeholder="Title"
            value={newSlideFields.title}
            onChange={(e) => setNewSlideFields({ ...newSlideFields, title: e.target.value })}
          />
          <input
            placeholder="Description"
            value={newSlideFields.description}
            onChange={(e) => setNewSlideFields({ ...newSlideFields, description: e.target.value })}
          />
          <input
            placeholder="Bookmark Title"
            value={newSlideFields.checkpointTitle}
            onChange={(e) => setNewSlideFields({ ...newSlideFields, checkpointTitle: e.target.value })}
          />
          <button
            onClick={() => {
              const newSlide = {
                id: uuidv4(),
                title: newSlideFields.title,
                description: newSlideFields.description,
                checkpoint: {
                  title: newSlideFields.checkpointTitle
                },
                type: 'StorySlide'
              };
              addSlideToMapAction(newSlide);
              updateGroupInStructure(newSlideGroupId, dataStructure, group => {
                group.children.push(newSlide.id);
              });
              setDataStructure({ ...dataStructure });
              setNewSlideModalOpen(false);
              setNewSlideFields({ title: '', description: '', checkpointTitle: '' });
            }}
          >
            Save
          </button>
          <button onClick={() => setNewSlideModalOpen(false)}>Cancel</button>
        </ModalContent>
      </Modal>


      {!treeData2 ? <div>Loading...</div> : (
        <div className={'TableForm ' + className}>
          {/* Header with add buttons */}
          <div className='TableForm-Header'>
            <div className='TableForm-Header-Right'>
              <AddButton
                variant="primary"
                text={`Add ${singularPageName}`}
                onClick={() => addLayerInGroup(dataStructure.id)}
              />
              <AddButton
                className='AddGroupButton'
                variant="primary"
                text="Add Story Map"
                onClick={addGroup}
              />
            </div>
          </div>

          <SortableTree
            data={treeData2}
            changeGroupName={(id, newName) => {
              updateGroupInStructure(id, dataStructure, group => {
                group.group = newName;
                setDataStructure({ ...dataStructure });
              });
            }}
            changeLayer={updateSlideAction}
            otherActionsFunction={otherSlideActions}
            rearrangeLayers={rearrangeTree}
            addLayerInGroup={addLayerInGroup}
            removeGroup={removeGroup}
            removeLayer={removeSlideAction}
            editLayerInGroupAction={editSlideInMapAction}
            isIndicator={false}
            collapsible
          />
        </div>
      )}
    </Fragment>
  );
}
