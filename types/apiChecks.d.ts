declare module 'apichecks' {
    // Define your custom types for API checks if needed
    // For example:
    type Platform = 'kick.com' | 'twitch.com' | 'youtube.com';
  
    function isKickLive(channelName: string, platform: Platform): Promise<boolean>;
  
    export { isKickLive };
  }
  