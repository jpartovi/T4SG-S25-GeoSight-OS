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

import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions } from '../../../../../store/dashboard';
import StoryMapsListForm from '../StoryMapsListForm';
import Modal, { ModalContent, ModalHeader } from '../../../../../components/Modal';
import { dictDeepCopy } from '../../../../../utils/main';
import StorySlideEditor from './StorySlideEditor'; // Your new component
import './style.scss';

export default function StoryMapsForm() {
  const dispatch = useDispatch();
  const dashboardData = useSelector(state => state.dashboard.data) || {};
  const {
    indicators: dashboardIndicators = [],
    relatedTables: dashboardRelatedTables = {},
    indicatorLayers = [], // now treated as slides
    indicatorLayersStructure = {}, // treated as storyMap structure
    referenceLayer = null
  } = dashboardData;

  const indicators = dashboardIndicators || [];
  const relatedTables = dashboardRelatedTables ? dictDeepCopy(dashboardRelatedTables, true) : {};
  const referenceLayerData = useSelector(state => {
    return referenceLayer?.identifier ? (state.referenceLayerData || {})[referenceLayer.identifier] : null;
  });

  const [currentMapName, setCurrentMapName] = useState('');
  const [slideEditorOpen, setSlideEditorOpen] = useState(false);

  const createCheckpointFromIndicator = (indicatorId) => ({
    selected_indicator_layers: [indicatorId],
    selected_context_layers: [],
    selected_basemap: 0,
    filters: {},
    extent: null,
    indicator_layer_show: true,
    context_layer_show: false,
    selected_admin_level: 0,
    is_3d_mode: false,
    position: { x: 0, y: 0, z: 0 }
  });

  const removeSlide = (slide) => {
    dispatch(Actions.IndicatorLayers.remove(slide));
  };

  return (
    <Fragment>
      <StoryMapsListForm
        pageName={'Story Maps'}
        data={(indicatorLayers || []).map(layer => ({ ...layer, trueId: -1 }))}
        dataStructure={indicatorLayersStructure || {}}
        setDataStructure={structure => {
          dispatch(Actions.Dashboard.updateStructure('indicatorLayersStructure', structure));
        }}
        defaultListData={(indicators || []).map(ind => ind?.name || '')}
        addLayerAction={(indicator, mapName) => {
          const checkpoint = createCheckpointFromIndicator(indicator.id);
          const newSlide = {
            id: Date.now().toString(),
            title: indicator.name,
            description: '',
            checkpoint,
            group: mapName
          };
          dispatch(Actions.IndicatorLayers.add(newSlide));
        }}
        removeLayerAction={removeSlide}
        changeLayerAction={(slide) => {
          dispatch(Actions.IndicatorLayers.update(slide));
        }}
        addLayerInGroupAction={(mapName) => {
          setCurrentMapName(mapName);
          setSlideEditorOpen(true);
        }}
      />

      {slideEditorOpen && (
        <Modal open={slideEditorOpen} onClosed={() => setSlideEditorOpen(false)}>
          <ModalHeader onClosed={() => setSlideEditorOpen(false)}>Add New Slide</ModalHeader>
          <ModalContent>
            <StorySlideEditor
              existingSlide={null}
              onSave={(slide) => {
                slide.group = currentMapName;
                dispatch(Actions.IndicatorLayers.add(slide));
                setSlideEditorOpen(false);
              }}
              onCancel={() => setSlideEditorOpen(false)}
              availableIndicators={indicators}
              indicatorLookup={{}} // Provide an empty object as default
            />
          </ModalContent>
        </Modal>
      )}
    </Fragment>
  );
}

