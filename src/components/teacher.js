export default {
  name: 'teacher',
  title: 'Faculty Members',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.email()
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true }
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image'
    }
  }
}