const TOKEN = "GWoKjXgU7c6EoJyGSaHIdQiAFZMZ3fw-";
const API = `https://blynk.cloud/external/api/get?token=${TOKEN}&`;

const pins = {
  flex1: "v1", flex2: "v2", pressure: "v3",
  gyroX: "v4", gyroY: "v5", gyroZ: "v6",
  accelX: "v7", accelY: "v8", accelZ: "v9"
};

let standard = { flex: null, pressure: null, motion: null };

document.getElementById("setStandard").addEventListener("click", async () => {
  const [f1, f2, p, gx, gy, gz] = await Promise.all([
    pins.flex1, pins.flex2, pins.pressure, pins.gyroX, pins.gyroY, pins.gyroZ
  ].map(p => fetch(API + p).then(r => r.text()).then(Number)));

  standard.flex = (f1 + f2) / 2;
  standard.pressure = p;
  standard.motion = Math.sqrt(gx ** 2 + gy ** 2 + gz ** 2);
  alert("✅ Standard values saved!");
});

document.getElementById("toggleSession").addEventListener("click", () => {
  document.getElementById("realtimePanel").classList.toggle("hidden");
});

function getColor(val, std) {
  const diff = Math.abs(val - std);
  if (diff < 5) return "var(--green)";
  if (diff < 15) return "var(--yellow)";
  return "var(--red)";
}

async function updateDashboard() {
  const data = Object.fromEntries(await Promise.all(
    Object.entries(pins).map(([k, v]) =>
      fetch(API + v).then(r => r.text()).then(n => [k, parseFloat(n)])
    )
  ));

  const flexAvg = (data.flex1 + data.flex2) / 2;
  const motion = Math.sqrt(data.gyroX ** 2 + data.gyroY ** 2 + data.gyroZ ** 2);

  document.getElementById("flexValue").innerText = flexAvg.toFixed(1);
  document.getElementById("pressureValue").innerText = data.pressure.toFixed(1);
  document.getElementById("motionValue").innerText = motion.toFixed(1);

  document.getElementById("flexCircle").style.background =
    standard.flex !== null ? getColor(flexAvg, standard.flex) : "#aaa";
  document.getElementById("pressureCircle").style.background =
    standard.pressure !== null ? getColor(data.pressure, standard.pressure) : "#aaa";
  document.getElementById("motionCircle").style.background =
    standard.motion !== null ? getColor(motion, standard.motion) : "#aaa";

  const keyMap = {
    f1: "flex1", f2: "flex2", p: "pressure",
    gx: "gyroX", gy: "gyroY", gz: "gyroZ",
    ax: "accelX", ay: "accelY", az: "accelZ"
  };

  Object.entries(keyMap).forEach(([short, full]) => {
    const val = data[full].toFixed(1);
    document.getElementById(short).innerText = val;
    const meter = document.getElementById(short + "m");
    if (meter) meter.value = val;
  });
}

setInterval(updateDashboard, 1000);
