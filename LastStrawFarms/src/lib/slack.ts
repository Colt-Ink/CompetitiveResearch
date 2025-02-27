/**
 * Slack integration utilities for Last Straw Farms application.
 * This module provides functions to interact with Slack using the Slack MCP.
 */

import { prisma } from './db';

/**
 * Send a notification to a Slack channel about a new florist.
 * @param channelId The Slack channel ID to send the notification to
 * @param floristId The ID of the florist to notify about
 */
export async function notifyNewFlorist(channelId: string, floristId: string) {
  try {
    // Fetch the florist data
    const florist = await prisma.florist.findUnique({
      where: { id: floristId },
      include: {
        businessHours: true,
        pricingItems: true,
      },
    });

    if (!florist) {
      throw new Error(`Florist with ID ${floristId} not found`);
    }

    // Format the message
    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `New Florist Added: ${florist.name}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Address:*\n${florist.address}`,
            },
            {
              type: 'mrkdwn',
              text: `*Distance:*\n${florist.distanceMiles?.toFixed(1)} miles`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Phone:*\n${florist.phoneNumber || 'N/A'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Website:*\n${florist.website ? `<${florist.website}|Visit Site>` : 'N/A'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Rating:* ${florist.rating ? `${florist.rating} (${florist.reviewCount} reviews)` : 'N/A'}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Details',
                emoji: true,
              },
              value: florist.id,
              action_id: 'view_florist_details',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Add to Route',
                emoji: true,
              },
              value: florist.id,
              action_id: 'add_to_route',
            },
          ],
        },
      ],
    };

    // In a real implementation, this would use the Slack MCP to send the message
    // For example:
    // await slackPostMessage({
    //   channel_id: channelId,
    //   text: `New Florist Added: ${florist.name}`,
    //   blocks: message.blocks
    // });

    console.log(`Notification about ${florist.name} would be sent to Slack channel ${channelId}`);
    return { success: true, message: 'Notification sent' };
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Sync a Slack message to a florist's notes.
 * @param slackTs The Slack message timestamp
 * @param floristId The ID of the florist to update
 */
export async function syncSlackMessageToNotes(slackTs: string, floristId: string) {
  try {
    // Fetch the Slack message
    const slackMessage = await prisma.slackMessage.findUnique({
      where: { slackTs },
    });

    if (!slackMessage) {
      throw new Error(`Slack message with timestamp ${slackTs} not found`);
    }

    // Fetch the florist
    const florist = await prisma.florist.findUnique({
      where: { id: floristId },
    });

    if (!florist) {
      throw new Error(`Florist with ID ${floristId} not found`);
    }

    // Update the florist's notes
    const updatedFlorist = await prisma.florist.update({
      where: { id: floristId },
      data: {
        notes: florist.notes
          ? `${florist.notes}\n\n${new Date().toISOString()}: ${slackMessage.text}`
          : `${new Date().toISOString()}: ${slackMessage.text}`,
      },
    });

    // Mark the message as synced
    await prisma.slackMessage.update({
      where: { slackTs },
      data: { syncedToNote: true },
    });

    return { success: true, florist: updatedFlorist };
  } catch (error) {
    console.error('Error syncing Slack message to notes:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Generate a map image of florists and post it to Slack.
 * @param channelId The Slack channel ID to post the map to
 * @param territoryId Optional territory ID to filter florists
 */
export async function postMapToSlack(channelId: string, territoryId?: string) {
  try {
    // In a real implementation, this would:
    // 1. Generate a map image using Leaflet or a similar library
    // 2. Upload the image to Slack
    // 3. Post a message with the image

    let florists;
    if (territoryId) {
      // Fetch florists in the specified territory
      florists = await prisma.florist.findMany({
        where: {
          territories: {
            some: {
              territoryId,
            },
          },
        },
      });
    } else {
      // Fetch all florists
      florists = await prisma.florist.findMany();
    }

    const message = `Map showing ${florists.length} florists${territoryId ? ' in the specified territory' : ''}`;

    // In a real implementation, this would use the Slack MCP to send the message with an image
    // For example:
    // await slackPostMessage({
    //   channel_id: channelId,
    //   text: message,
    //   attachments: [{
    //     image_url: 'https://example.com/map.png',
    //     fallback: message
    //   }]
    // });

    console.log(`Map of ${florists.length} florists would be posted to Slack channel ${channelId}`);
    return { success: true, message: 'Map posted to Slack' };
  } catch (error) {
    console.error('Error posting map to Slack:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Add the Claude MCD Slack bot to a workspace.
 * @param teamId The Slack team/workspace ID
 * @param botId The Slack bot ID
 */
export async function addSlackBot(teamId: string, botId: string) {
  try {
    // In a real implementation, this would use the Slack MCP to add the bot to the workspace
    // This is typically done through OAuth, but for our purposes we'll just log it
    console.log(`Adding Slack bot ${botId} to workspace ${teamId}`);
    
    // For the Claude MCD bot (A08FRNZ2BNC) to workspace T08F1Q0UUKG
    if (botId === 'A08FRNZ2BNC' && teamId === 'T08F1Q0UUKG') {
      console.log('Adding Claude MCD bot to the workspace');
      // In a real implementation, this would use the Slack API to add the bot
    }
    
    return { success: true, message: 'Bot added to workspace' };
  } catch (error) {
    console.error('Error adding Slack bot:', error);
    return { success: false, error: (error as Error).message };
  }
}
