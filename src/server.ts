import { app } from "./app";

const port = process.env.PORT || 9080;

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
