export type Post = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: {
    _acf_changed: boolean;
    footnotes: string;
  };
  class_list: Array<string>;
  acf: {
    "work-number": number;
    "work-type": string;
    work_period: string;
    summary: string;
    site_url: string;
    github_url: string;
    tec: Array<string>;
  };
  _links: {
    self: Array<{
      href: string;
      targetHints: {
        allow: Array<string>;
      };
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
    replies: Array<{
      embeddable: boolean;
      href: string;
    }>;
    "version-history": Array<{
      count: number;
      href: string;
    }>;
    "predecessor-version": Array<{
      id: number;
      href: string;
    }>;
    "wp:attachment": Array<{
      href: string;
    }>;
    curies: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
};
