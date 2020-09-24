module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/create",
        permanent: true,
      },
    ];
  },
};
