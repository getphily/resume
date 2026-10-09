import re

css = """
[data-theme="japan-blues"] {
  --background:oklch(0.9818 0.0054 95.0986);
  --foreground:oklch(0.1450 0 0);
  --card:oklch(0.9818 0.0054 95.0986);
  --card-foreground:oklch(0.145 0 0);
  --popover:oklch(1.0000 0 0);
  --popover-foreground:oklch(0.2671 0.0196 98.9390);
  --primary:oklch(0.7040 0.0400 256.7880);
  --primary-foreground:oklch(1.0000 0 0);
  --secondary:oklch(0.8690 0.0220 252.8940);
  --secondary-foreground:oklch(0.3720 0.0440 257.2870);
  --muted:oklch(0.9230 0.0030 48.7170);
  --muted-foreground:oklch(0.5530 0.0130 58.0710);
  --accent:oklch(0.9245 0.0138 92.9892);
  --accent-foreground:oklch(0.2333 0.0195 275.9526);
  --destructive:oklch(0.1908 0.0020 106.5859);
  --border:oklch(0.8690 0.0050 56.3660);
  --input:oklch(0.9220 0 0);
  --ring:oklch(0.5540 0.0460 257.4170);
  --chart-1:oklch(0.8090 0.1050 251.8130);
  --chart-2:oklch(0.8110 0.1110 293.5710);
  --chart-3:oklch(0.8816 0.0276 93.1280);
  --chart-4:oklch(0.7040 0.0400 256.7880);
  --chart-5:oklch(0.5880 0.1580 241.9660);
  --sidebar:oklch(0.9663 0.0080 98.8792);
  --sidebar-foreground:oklch(0.2680 0.0070 34.2980);
  --sidebar-primary:oklch(0.5540 0.0460 257.4170);
  --sidebar-primary-foreground:oklch(0.9881 0 0);
  --sidebar-accent:oklch(0.9245 0.0138 92.9892);
  --sidebar-accent-foreground:oklch(0.3250 0 0);
  --sidebar-border:oklch(0.8690 0.0220 252.8940);
  --sidebar-ring:oklch(0.7040 0.0400 256.7880);
}
[data-theme="astrovista"] {
  --background:oklch(0.9383 0.0042 236.4993);
  --foreground:oklch(0.3211 0 0);
  --card:oklch(1.0000 0 0);
  --card-foreground:oklch(0.3211 0 0);
  --popover:oklch(1.0000 0 0);
  --popover-foreground:oklch(0.3211 0 0);
  --primary:oklch(0.6420 0.1691 38.5815);
  --primary-foreground:oklch(1.0000 0 0);
  --secondary:oklch(0.4138 0.0846 259.8759);
  --secondary-foreground:oklch(1.0000 0 0);
  --muted:oklch(0.9846 0.0017 247.8389);
  --muted-foreground:oklch(0.5510 0.0234 264.3637);
  --accent:oklch(0.9119 0.0222 243.8174);
  --accent-foreground:oklch(0.3791 0.1378 265.5222);
  --destructive:oklch(0.6368 0.2078 25.3313);
  --border:oklch(0.8452 0 0);
  --input:oklch(0.9700 0.0029 264.5420);
  --ring:oklch(0.6397 0.1720 36.4421);
  --chart-1:oklch(0.6693 0.0706 248.9230);
  --chart-2:oklch(0.6678 0.1546 41.6200);
  --chart-3:oklch(0.5957 0.1807 19.9763);
  --chart-4:oklch(0.7859 0.1342 83.6986);
  --chart-5:oklch(0.4227 0.0732 267.3899);
  --sidebar:oklch(0.9030 0.0046 258.3257);
  --sidebar-foreground:oklch(0.3211 0 0);
  --sidebar-primary:oklch(0.6397 0.1720 36.4421);
  --sidebar-primary-foreground:oklch(1.0000 0 0);
  --sidebar-accent:oklch(0.9119 0.0222 243.8174);
  --sidebar-accent-foreground:oklch(0.3791 0.1378 265.5222);
  --sidebar-border:oklch(0.9276 0.0058 264.5313);
  --sidebar-ring:oklch(0.6397 0.1720 36.4421);
}
[data-theme="porfolio"] {
  --background:oklch(0.9755 0.0067 97.3510);
  --foreground:oklch(0.2178 0 0);
  --card:oklch(1.0000 0 0);
  --card-foreground:oklch(0.2178 0 0);
  --popover:oklch(1.0000 0 0);
  --popover-foreground:oklch(0.2178 0 0);
  --primary:oklch(0.7414 0.0738 84.5946);
  --primary-foreground:oklch(1.0000 0 0);
  --secondary:oklch(0.9096 0.0167 91.5611);
  --secondary-foreground:oklch(0.2178 0 0);
  --muted:oklch(0.9459 0.0165 91.5544);
  --muted-foreground:oklch(0.5022 0.0278 85.7741);
  --accent:oklch(0.7414 0.0738 84.5946);
  --accent-foreground:oklch(1.0000 0 0);
  --destructive:oklch(0.5680 0.2002 26.4057);
  --border:oklch(0.8986 0.0258 97.1423);
  --input:oklch(0.8986 0.0258 97.1423);
  --ring:oklch(0.7414 0.0738 84.5946);
  --chart-1:oklch(0.7414 0.0738 84.5946);
  --chart-2:oklch(0.3738 0.0116 258.3660);
  --chart-3:oklch(0.9096 0.0167 91.5611);
  --chart-4:oklch(0.5933 0.0472 87.9063);
  --chart-5:oklch(0.2958 0.0084 255.5667);
  --sidebar:oklch(0.9459 0.0165 91.5544);
  --sidebar-foreground:oklch(0.2178 0 0);
  --sidebar-primary:oklch(0.7414 0.0738 84.5946);
  --sidebar-primary-foreground:oklch(1.0000 0 0);
  --sidebar-accent:oklch(0.8986 0.0258 97.1423);
  --sidebar-accent-foreground:oklch(0.2178 0 0);
  --sidebar-border:oklch(0.8986 0.0258 97.1423);
  --sidebar-ring:oklch(0.7414 0.0738 84.5946);
}
[data-theme="vescrow"] {
  --background:oklch(0.9924 0.0028 308.4292);
  --foreground:oklch(0.1288 0.0219 314.0129);
  --card:oklch(1.0000 0 0);
  --card-foreground:oklch(0.1288 0.0219 314.0129);
  --popover:oklch(1.0000 0 0);
  --popover-foreground:oklch(0.1288 0.0219 314.0129);
  --primary:oklch(0.2236 0.1469 265.8205);
  --primary-foreground:oklch(1.0000 0 0);
  --secondary:oklch(0.9387 0.0262 264.4409);
  --secondary-foreground:oklch(0.4691 0.2225 262.4817);
  --muted:oklch(0.9518 0.0057 308.3939);
  --muted-foreground:oklch(0.4882 0.0203 308.0008);
  --accent:oklch(0.9356 0.0312 279.8620);
  --accent-foreground:oklch(0.4691 0.2225 262.4817);
  --destructive:oklch(0.5858 0.2220 17.5846);
  --border:oklch(0.9160 0.0120 313.2115);
  --input:oklch(0.9160 0.0120 313.2115);
  --ring:oklch(0.6219 0.2036 262.1505);
  --chart-1:oklch(0.4691 0.2225 262.4817);
  --chart-2:oklch(0.6056 0.2189 292.7172);
  --chart-3:oklch(0.6668 0.2591 322.1499);
  --chart-4:oklch(0.6450 0.2154 16.4393);
  --chart-5:oklch(0.7049 0.1867 47.6044);
  --sidebar:oklch(0.9387 0.0262 264.4409);
  --sidebar-foreground:oklch(0.2138 0.0755 259.0572);
  --sidebar-primary:oklch(0.9924 0.0028 308.4292);
  --sidebar-primary-foreground:oklch(0.2108 0.0426 270.3694);
  --sidebar-accent:oklch(0.2506 0.0689 276.7216);
  --sidebar-accent-foreground:oklch(1.0000 0 0);
  --sidebar-border:oklch(0.2445 0.0736 280.5871);
  --sidebar-ring:oklch(0.3447 0.1522 272.4233);
}
[data-theme="polaris"] {
  --background:oklch(0.9816 0.0055 211.0391);
  --foreground:oklch(0.2204 0.0300 218.3459);
  --card:oklch(0.9977 0.0032 197.1059);
  --card-foreground:oklch(0.1499 0.0196 221.4949);
  --popover:oklch(0.9977 0.0032 197.1059);
  --popover-foreground:oklch(0.1499 0.0196 221.4949);
  --primary:oklch(0.4761 0.0870 221.3232);
  --primary-foreground:oklch(1.0000 0 0);
  --secondary:oklch(0.8216 0.1707 78.9825);
  --secondary-foreground:oklch(0.2506 0.0502 64.9833);
  --muted:oklch(0.9422 0.0110 211.0375);
  --muted-foreground:oklch(0.4987 0.0150 221.6120);
  --accent:oklch(0.6554 0.1151 214.5277);
  --accent-foreground:oklch(1.0000 0 0);
  --destructive:oklch(0.5873 0.1851 35.4282);
  --border:oklch(0.9008 0.0146 213.1014);
  --input:oklch(0.7989 0.0154 218.0794);
  --ring:oklch(0.4761 0.0870 221.3232);
  --chart-1:oklch(0.4761 0.0870 221.3232);
  --chart-2:oklch(0.8216 0.1707 78.9825);
  --chart-3:oklch(0.6090 0.1599 146.0732);
  --chart-4:oklch(0.6554 0.1151 214.5277);
  --chart-5:oklch(0.5873 0.1851 35.4282);
  --sidebar:oklch(0.9816 0.0055 211.0391);
  --sidebar-foreground:oklch(0.1499 0.0196 221.4949);
  --sidebar-primary:oklch(0.4761 0.0870 221.3232);
  --sidebar-primary-foreground:oklch(1.0000 0 0);
  --sidebar-accent:oklch(0.9652 0.0076 207.1419);
  --sidebar-accent-foreground:oklch(0.1499 0.0196 221.4949);
  --sidebar-border:oklch(0.9008 0.0146 213.1014);
  --sidebar-ring:oklch(0.4761 0.0870 221.3232);
}
[data-theme="claude"] {
  --background:oklch(0.98 0.01 95.10);
  --foreground:oklch(0.34 0.03 95.72);
  --card:oklch(0.99 0 0);
  --card-foreground:oklch(0.19 0.00 106.59);
  --popover:oklch(1.00 0 0);
  --popover-foreground:oklch(0.27 0.02 98.94);
  --primary:oklch(0.62 0.14 39.04);
  --primary-foreground:oklch(1.00 0 0);
  --secondary:oklch(0.92 0.01 92.99);
  --secondary-foreground:oklch(0.43 0.02 98.60);
  --muted:oklch(0.93 0.02 90.24);
  --muted-foreground:oklch(0.61 0.01 97.42);
  --accent:oklch(0.7691 0.1177 38.993);
  --accent-foreground:oklch(0.2691 0.054 39.52);
  --destructive:oklch(0.19 0.00 106.59);
  --border:oklch(0.88 0.01 97.36);
  --input:oklch(0.76 0.02 98.35);
  --ring:oklch(0.59 0.17 253.06);
  --chart-1:oklch(0.56 0.13 43.00);
  --chart-2:oklch(0.69 0.16 290.41);
  --chart-3:oklch(0.88 0.03 93.13);
  --chart-4:oklch(0.88 0.04 298.18);
  --chart-5:oklch(0.56 0.13 42.06);
  --sidebar:oklch(0.97 0.01 98.88);
  --sidebar-foreground:oklch(0.36 0.01 106.65);
  --sidebar-primary:oklch(0.62 0.14 39.04);
  --sidebar-primary-foreground:oklch(0.99 0 0);
  --sidebar-accent:oklch(0.92 0.01 92.99);
  --sidebar-accent-foreground:oklch(0.33 0 0);
  --sidebar-border:oklch(0.94 0 0);
  --sidebar-ring:oklch(0.77 0 0);
}
"""

with open('src/app/globals.css', 'r') as f:
    orig_css = f.read()

orig_css += "\n" + css

with open('src/app/globals.css', 'w') as f:
    f.write(orig_css)
