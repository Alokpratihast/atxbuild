import { withAuth } from "next-auth/middleware";

export default withAuth({

  pages: {
    signIn: "/", // redirect to home if not authenticated
  },
});

 

export const config = {
 matcher: [
    "/admindashboard/:path*",
    "/employerdashboard/:path*",
    "/jobseekerdashboard/:path*",
  ],
};
