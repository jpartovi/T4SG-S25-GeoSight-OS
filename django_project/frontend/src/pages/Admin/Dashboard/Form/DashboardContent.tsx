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

import React, { memo } from 'react';
import { useSelector } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';
import GeneralForm from "./General";
import BasemapsForm from "./Basemaps";
import IndicatorsForm from "./Indicators";
import IndicatorLayersForm from "./IndicatorLayers";
import StoryMapsForm from "./StoryMaps";
import ContextLayerForm from "./ContextLayer";
import FiltersForm from "./Filters";
import WidgetForm from "./Widgets";
import RelatedTableForm from "./RelatedTable";
import ToolsForm from "./Tools";
import ShareForm from "./Share";
import { PAGES } from "./types.d";
import IndicatorLayersControl from "./IndicatorLayers/Control";
import { useTranslation } from 'react-i18next';

export interface Props {
  page: string;
}

/** Dashboard Form Section Content */
export const DashboardFormContent = memo(
  ({ page }: Props) => {
    // @ts-ignore
    const user_permission = useSelector(state => state.dashboard?.data?.user_permission);
    const { t } = useTranslation();
    
    // Safely render the appropriate form based on the page
    const renderForm = () => {
      try {
        if (page === PAGES.BASEMAPS) return <BasemapsForm />;
        if (page === PAGES.INDICATORS) return <IndicatorsForm />;
        if (page === PAGES.INDICATOR_LAYERS) return <IndicatorLayersForm />;
        if (page === PAGES.CONTEXT_LAYERS) return <ContextLayerForm />;
        if (page === PAGES.FILTERS) return <FiltersForm />;
        if (page === PAGES.WIDGETS) return <WidgetForm />;
        if (page === PAGES.RELATED_TABLES) return <RelatedTableForm />;
        if (page === PAGES.TOOLS) return <ToolsForm />;
        if (page === PAGES.SHARE && user_permission.share) return <ShareForm />;
        if (page === PAGES.STORYMAPS) {
          return (
            <div style={{ display: 'block', height: 'auto', opacity: 1 }}>
              <StoryMapsForm />
            </div>
          );
        }
        return null;
      } catch (error) {
        console.error("Error rendering form:", error);
        return <div>Error loading form content</div>;
      }
    };
    
    return (
      <div className='DashboardFormContent'>
        {
          user_permission !== undefined ?
            <>
              <GeneralForm />
              <IndicatorLayersControl />
              {renderForm()}
            </> :
            <div className='DashboardFormLoading'>
              <div className='DashboardFormLoadingSection'>
                <CircularProgress />
                <div>
                  {t("admin.fetchingProjectData")}
                </div>
              </div>
            </div>
        }
      </div>
    )
  }
)

export default DashboardFormContent;