export const generateCDNScript = (pixelId: string): string => {
  return `
<!-- Facebook Funnel Tracking Script -->
<script>
  window.pixelId = "${pixelId}";
  var script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("defer", "");
  script.setAttribute("src", "https://cdn.yourservice.com/tracking/tracker.min.js");
  document.head.appendChild(script);
</script>
<!-- End Facebook Funnel Tracking Script -->`;
};