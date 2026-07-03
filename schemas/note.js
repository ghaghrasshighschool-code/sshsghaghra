export default {
  name: 'note',
  title: 'Study Materials (Notes)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'className',
      title: 'Class Name',
      type: 'string',
      description: 'e.g., Class 10, Class 9',
      validation: Rule => Rule.required()
    },
    {
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'file',
      title: 'Note File',
      type: 'file',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      className: 'className',
      subject: 'subject'
    },
    prepare({title, className, subject}) {
      return {
        title: title,
        subtitle: `${className} | ${subject}`
      }
    }
  }
}