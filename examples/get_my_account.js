import EdenClient from "../eden.js";

let eden = new EdenClient();
eden.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2RiZThlYTRhOGFlYzlhMTEyNzU1Y2IiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjc1MzU3NTkxfQ.X2xmUJdj1JHkGNPeQ9LBHPTXQ6IeXUvL5-l-ac8bwBc')

let result = await eden.getProfile();
console.log(result);

result = await eden.updateProfile({
  username: "genekogan",
  discordId: "genekogan#1234",
});
console.log(result);

result = await eden.getManna();
console.log(result);
