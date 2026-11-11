const port = Number(process.env.PORT ?? 3000);

fetch(`http://127.0.0.1:${port}/health`)
  .then((response) => {
    if (response.status !== 200) process.exitCode = 1;
  })
  .catch(() => {
    process.exitCode = 1;
  });
