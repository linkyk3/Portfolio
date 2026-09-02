// Newest post first - the Blog page defaults to posts[0] on load. Dates use dd.mm.yy.
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'entry-1',
    title: 'Placeholder',
    date: '02.09.26',
    content: `
      <p>This is the first entry on the blog. It's a placeholder for now, but new notes will show up here.</p>
    `,
  },
];
