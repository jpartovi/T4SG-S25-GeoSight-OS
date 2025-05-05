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

import React from 'react';
import { Plugin } from "../../MapLibre/Plugin";
import { EmbedConfig } from "../../../../utils/embed";

import './style.scss';

/**
 * Bottom panel component that is always visible at the bottom of the map.
 */
export default function BottomPanel() {

    console.log('EmbedConfig', EmbedConfig());
    const showStoryTab = true//EmbedConfig().story_tab
    return (
    <>
        {showStoryTab && (
        <Plugin>
            <div className='BottomPanel'>
            <div className='BottomPanelContent'>
            {/* Add your content here */}
            <div className='Title'>Story Map Panel</div>
                <div className='Content'>
                    This is a story map panel
                </div>
            </div>
        </div>
        </Plugin>
    )}
    </>
    )
} 