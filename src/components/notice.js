export default {
  name: 'notice',
  title: 'Notices & Announcements',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'attachment',
      title: 'Attachment File',
      type: 'file'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date'
    }
  }
}