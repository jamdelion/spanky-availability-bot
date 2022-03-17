const interactiveButtons = {
    text: 'Gig details',
    response_type: 'in_channel',
    attachments: [{
      text: 'Are you available for this?',
      callback_id: 'availability',
      actions: [
        {
          name: 'availability',
          text: 'Yes',
          value: 'available',
          type: 'button',
          style: 'primary',
        },
        {
          name: 'availability',
          text: 'No',
          value: 'busy',
          type: 'button',
          style: 'danger',
        },
        {
            name: 'availability',
            text: 'Maybe',
            value: 'maybe',
            type: 'button',
          },
      ],
    }],
  };

  module.exports = {interactiveButtons}