/**
 * TriggerSetup.js
 * Functions for managing time-based triggers for automatic consolidation
 */

/**
 * Set up a daily trigger to run consolidation automatically
 * Run this function once from the Apps Script IDE to install the trigger
 * Recommended time: 8-9 AM daily
 */
function setupDailyTrigger() {
  // First, remove any existing triggers to avoid duplicates
  removeDailyTrigger();

  // Create new daily trigger
  // Runs between 8-9 AM in the spreadsheet's timezone
  ScriptApp.newTrigger('processOpportunities')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

  Logger.log('✓ Daily trigger created successfully!');
  Logger.log('Consolidation will run daily between 8-9 AM');

  // Show confirmation to user
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Daily Trigger Installed',
      'Customer consolidation will now run automatically every day between 8-9 AM.\n\n' +
      'You can view and manage triggers in the Apps Script IDE:\n' +
      'Extensions > Apps Script > Triggers (clock icon)',
      ui.ButtonSet.OK
    );
  } catch (e) {
    // If no UI available (running from IDE), just log
    Logger.log('Trigger installed - confirmation dialog not shown (running from IDE)');
  }
}

/**
 * Remove the daily trigger
 * Run this function to disable automatic consolidation
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(function(trigger) {
    // Remove any time-based triggers for processOpportunities
    if (trigger.getHandlerFunction() === 'processOpportunities' &&
        trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      ScriptApp.deleteTrigger(trigger);
      removed++;
      Logger.log('Removed existing trigger: ' + trigger.getUniqueId());
    }
  });

  if (removed > 0) {
    Logger.log('✓ Removed ' + removed + ' existing trigger(s)');
  } else {
    Logger.log('No existing triggers found');
  }

  return removed;
}

/**
 * List all active triggers for this project
 * Useful for debugging and checking trigger status
 */
function listActiveTriggers() {
  const triggers = ScriptApp.getProjectTriggers();

  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('ACTIVE TRIGGERS FOR THIS PROJECT');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (triggers.length === 0) {
    Logger.log('⚠ No active triggers found');
    Logger.log('Run setupDailyTrigger() to create one');
  } else {
    triggers.forEach(function(trigger, index) {
      Logger.log('\nTrigger #' + (index + 1) + ':');
      Logger.log('  Function: ' + trigger.getHandlerFunction());
      Logger.log('  Type: ' + trigger.getEventType());

      if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
        // Get trigger details for time-based triggers
        const triggerSource = trigger.getTriggerSource();
        Logger.log('  Source: ' + triggerSource);

        // Try to get schedule info (not all properties are available on all trigger types)
        try {
          Logger.log('  Trigger ID: ' + trigger.getUniqueId());
        } catch (e) {
          // Some properties may not be accessible
        }
      }

      Logger.log('─────────────────────────────────────────');
    });

    Logger.log('\nTotal triggers: ' + triggers.length);
  }

  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return triggers;
}

/**
 * Set up a custom schedule trigger
 * @param {number} hour - Hour of day (0-23)
 * @param {number} intervalDays - Run every X days (default: 1 for daily)
 */
function setupCustomTrigger(hour, intervalDays) {
  hour = hour || 8;
  intervalDays = intervalDays || 1;

  // Validate hour
  if (hour < 0 || hour > 23) {
    throw new Error('Hour must be between 0 and 23');
  }

  // Remove existing triggers
  removeDailyTrigger();

  // Create custom trigger
  ScriptApp.newTrigger('processOpportunities')
    .timeBased()
    .atHour(hour)
    .everyDays(intervalDays)
    .create();

  Logger.log('✓ Custom trigger created successfully!');
  Logger.log('Schedule: Every ' + intervalDays + ' day(s) at hour ' + hour + ':00');

  // Show confirmation to user
  try {
    const ui = SpreadsheetApp.getUi();
    const frequency = intervalDays === 1 ? 'daily' : 'every ' + intervalDays + ' days';
    ui.alert(
      'Custom Trigger Installed',
      'Customer consolidation will now run ' + frequency + ' at ' + hour + ':00.\n\n' +
      'You can view and manage triggers in the Apps Script IDE:\n' +
      'Extensions > Apps Script > Triggers (clock icon)',
      ui.ButtonSet.OK
    );
  } catch (e) {
    Logger.log('Trigger installed - confirmation dialog not shown (running from IDE)');
  }
}

/**
 * Menu item handler for setting up daily trigger
 * Called from the custom menu
 */
function setupTriggerFromMenu() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Set Up Daily Trigger',
    'This will create a daily trigger to run consolidation automatically between 8-9 AM.\n\n' +
    'Do you want to continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    setupDailyTrigger();
  } else {
    ui.alert('Setup Cancelled', 'No trigger was created.', ui.ButtonSet.OK);
  }
}

/**
 * Menu item handler for removing daily trigger
 * Called from the custom menu
 */
function removeTriggerFromMenu() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Remove Daily Trigger',
    'This will disable automatic consolidation.\n\n' +
    'You can still run consolidation manually from the menu.\n\n' +
    'Do you want to continue?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const removed = removeDailyTrigger();

    if (removed > 0) {
      ui.alert(
        'Trigger Removed',
        'Automatic consolidation has been disabled.\n\n' +
        'You can still run consolidation manually using:\n' +
        'Customer Consolidation > Run Consolidation',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        'No Triggers Found',
        'There were no active triggers to remove.',
        ui.ButtonSet.OK
      );
    }
  } else {
    ui.alert('Cancelled', 'No changes were made.', ui.ButtonSet.OK);
  }
}

/**
 * Menu item handler for viewing active triggers
 * Called from the custom menu
 */
function viewTriggersFromMenu() {
  const triggers = ScriptApp.getProjectTriggers();
  const ui = SpreadsheetApp.getUi();

  if (triggers.length === 0) {
    ui.alert(
      'No Active Triggers',
      'There are no active triggers configured.\n\n' +
      'To set up automatic consolidation:\n' +
      'Customer Consolidation > Set Up Daily Trigger',
      ui.ButtonSet.OK
    );
    return;
  }

  let message = 'Active Triggers:\n\n';

  triggers.forEach(function(trigger, index) {
    message += (index + 1) + '. Function: ' + trigger.getHandlerFunction() + '\n';

    if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
      message += '   Type: Time-based (scheduled)\n';
    } else if (trigger.getEventType() === ScriptApp.EventType.ON_OPEN) {
      message += '   Type: On spreadsheet open\n';
    } else {
      message += '   Type: ' + trigger.getEventType() + '\n';
    }

    message += '\n';
  });

  message += 'To manage triggers in detail:\n';
  message += 'Extensions > Apps Script > Triggers (clock icon)';

  ui.alert('Active Triggers', message, ui.ButtonSet.OK);
}
