import React, { Fragment, useRef, useState } from 'react';

// Component imports
import {
  StarOffIcon,
} from "../../../../components/Icons";
import CustomPopover from "../../../../components/CustomPopover";
import { PluginChild } from "../../MapLibre/Plugin";
import { domain } from "../../../../utils/main";
import { DjangoRequests } from "../../../../Requests";

import './style.scss';
import { Button } from '@mui/material';
import { ProjectCheckpoint } from "../../../../components/ProjectCheckpoint";

// Storymap component
export default function StoryMapSelector({ map }) {

  const projectCheckpointRef = useRef(null);
  const [projectCheckpointEnable, setProjectCheckpointEnable] = useState(false)

  const storyMaps = [
    {
      name: "Story 1",
    },
    {
      name: "Story 2",
    },
    {
      name: "Story 3",
    },
  ]

  const onSelect = async () => {
    // Get current map state from project checkpoint
    const mapState = projectCheckpointRef.current.getData();

    // Configure embed to only show map and story tab
    const embedConfig = {
      layer_tab: false,
      filter_tab: false,
      widget_tab: false,
      map: true,
      story_tab: true,
      ...mapState // Include current map state
    }

    try {
      // Create embed with config
      const response = await DjangoRequests.post(
        urls.embedDetail,
        embedConfig
      );

      // Open embed URL in new tab
      const embedUrl = `${domain()}/embed/${response.data.code}`;
      window.open(embedUrl, '_blank');
    } catch (err) {
      console.error("Error creating storymap embed:", err);
    }
  }

  return (
    <Fragment>
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
        {/* LIST OF STORYMAPS */}
        <div className='Body'>
          <table>
            <tbody>
              {
                storyMaps.map((storymap, index) => (
                  <tr key={index}>
                    <Button onClick={() => onSelect()}>
                      {storymap.name}
                    </Button>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </CustomPopover>
    </Fragment>
  );
}
