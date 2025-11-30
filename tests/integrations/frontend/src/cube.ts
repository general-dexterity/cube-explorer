import cube from "@cubejs-client/core";

const CUBE_API_URL =
  import.meta.env.VITE_CUBE_API_URL || "http://localhost:4000/cubejs-api/v1";
const CUBE_API_TOKEN =
  import.meta.env.VITE_CUBE_API_TOKEN || "cube-explorer-dev-secret";

export const cubeApi = cube(CUBE_API_TOKEN, {
  apiUrl: CUBE_API_URL,
});
