export const schemaTypes = [
    // Teacher Schema
    {
        name: 'teacher',
        type: 'document',
        title: 'Teachers',
        fields: [
            { name: 'name', type: 'string', title: 'Full Name' },
            { name: 'subject', type: 'string', title: 'Subject' },
            { name: 'email', type: 'string', title: 'Email Address' },
            { name: 'role', type: 'string', title: 'Role (e.g. Senior Teacher)' },
            { name: 'image', type: 'image', title: 'Profile Image', options: { hotspot: true } },
        ]
    },
    // Notes Schema (for Student Portal)
    {
        name: 'note',
        type: 'document',
        title: 'Study Materials',
        fields: [
            { name: 'title', type: 'string', title: 'Note Title' },
            { name: 'className', type: 'string', title: 'Class (e.g. Class 10)' },
            { name: 'subject', type: 'string', title: 'Subject' },
            { name: 'file', type: 'file', title: 'Upload PDF/File' },
        ]
    },
    // Notice Schema
    {
        name: 'notice',
        type: 'document',
        title: 'Announcements',
        fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'date', type: 'date', title: 'Notice Date' },
            { name: 'description', type: 'text', title: 'Short Description' },
            { name: 'attachment', type: 'file', title: 'Attachment (Optional)' },
        ]
    }
];