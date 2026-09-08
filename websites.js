// Edit this file to add, remove, or modify learning resources.
// The UI, cards, search, categories, and responsive layout are generated automatically.

const siteOwner = "iReally";

const categories = [
  "Python",
  "AI / ML & Data Science",
  "DSA",
  "AI",
  "Tools",
  "DevOps & Clouds",
  "Misc",
  "Web Development",
  "Computer Science"
];

const websites = [
  {
    name: "Python",
    url: "https://docs.python.org/3/",
    category: "Python",
    description: "Python Documentation",
  },
  {
    name: "Pandas",
    url: "https://pandas.pydata.org/docs/",
    category: "Python",
    description: "Pandas Documentation",
    favourite: true,
  },
  {
    name: "NumPy",
    url: "https://numpy.org/doc/",
    category: "Python",
    description: "NumPy Documentation",
  },
  {
    name: "Matplotlib",
    url: "https://matplotlib.org/stable/index.html",
    category: "Python",
    description: "Matplotlib Documentation",
  },
  {
    name: "Seaborn",
    url: "https://seaborn.pydata.org/",
    category: "Python",
    description: "Seaborn Documentation",
  },
  {
    name: "Jupyter",
    url: "https://docs.jupyter.org/en/latest/",
    category: "Python",
    description: "Jupyter Documentation",
  },
  {
    name: "Python Tutor",
    url: "https://pythontutor.com/",
    category: "Python",
    description: "Python Tutor",
  },
  {
    name: "Real Python",
    url: "https://realpython.com",
    category: "Python",
    description: "Python tutorials",
  },
  {
    name: "Scikit-learn",
    url: "https://scikit-learn.org",
    category: "AI / ML & Data Science",
    description: "Machine learning tool",
  },
  {
    name: "PyTorch",
    url: "https://docs.pytorch.org/docs/2.14/",
    category: "AI / ML & Data Science",
    description: "Pytorch Documentation",
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/docs",
    category: "AI / ML & Data Science",
    description: "Kaggle Documentation",
  },
  {
    name: "Hugging Face",
    url: "https://huggingface.co",
    category: "AI / ML & Data Science",
    description: "AI models and datasets",
    logo: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
  },
  {
    name: "Data Science ChaiCode",
    url: "https://datascience.chaicode.com/",
    category: "AI / ML & Data Science",
    description: "Data Science Visual",
    // logo: "",
  },
  {
    name: "GitHub",
    url: "https://github.com",
    category: "Tools",
    description: "Code and collaboration",
    favourite: false,   // <-- marked as favourite initially
  },
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    category: "Tools",
    description: "Programming Q&A",
  },
  {
    name: "DevDocs",
    url: "https://devdocs.io",
    category: "Tools",
    description: "Developer documentation",
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com/",
    category: "AI",
    description: "DeepSeek",
    favourite: true,   // <-- also favourite
  },
  {
    name: "Docker",
    url: "https://docs.docker.com/",
    category: "DevOps & Clouds",
    description: "Docker documentation",
  },
  {
    name: "Kubernetes",
    url: "https://kubernetes.io/docs/home/",
    category: "DevOps & Clouds",
    description: "Kubernetes documentation",
  },
  {
    name: "LeetCode",
    url: "https://leetcode.com",
    category: "DSA",
    description: "Practice coding",
    logo: "https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png",
    favourite: true,
  },
  {
    name: "VisuAlgo",
    url: "https://visualgo.net",
    category: "DSA",
    description: "Visualize algorithms",
    favourite: true,
  },
  {
    name: "DSA ChaiCode",
    url: "https://dsa.chaicode.com/",
    category: "DSA",
    description: "Visualize algorithms",
    favourite: true,
  },
  {
    name: "Typing",
    url: "https://typing.com",
    category: "Misc",
    description: "Typing practice",
  },
  {
    name: "Keybr",
    url: "https://keybr.com",
    category: "Misc",
    description: "Typing practice",
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    category: "Web Development",
    description: "Web development reference",
  },
];
