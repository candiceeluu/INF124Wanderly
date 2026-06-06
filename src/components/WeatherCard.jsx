import { useEffect, useState } from 'react'
import { Cloud, MapPin, RefreshCw } from 'lucide-react'

const WMO = {
  0:  { label: 'Clear',          icon: '☀️' },
  1:  { label: 'Mostly clear',   icon: '🌤️' },
  2:  { label: 'Partly cloudy',  icon: '⛅' },
  3:  { label: 'Overcast',       icon: '☁️' },
  45: { label: 'Foggy',          icon: '🌫️' },
  48: { label: 'Foggy',          icon: '🌫️' },
  51: { label: 'Light drizzle',  icon: '🌦️' },
  53: { label: 'Drizzle',        icon: '🌦️' },
  55: { label: 'Heavy drizzle',  icon: '🌧️' },
  61: { label: 'Light rain',     icon: '🌧️' },
  63: { label: 'Rain',           icon: '🌧️' },
  65: { label: 'Heavy rain',     icon: '🌧️' },
  71: { label: 'Light snow',     icon: '🌨️' },
  73: { label: 'Snow',           icon: '🌨️' },
  75: { label: 'Heavy snow',     icon: '❄️' },
  77: { label: 'Snow grains',    icon: '❄️' },
  80: { label: 'Light showers',  icon: '🌦️' },
  81: { label: 'Showers',        icon: '🌧️' },
  82: { label: 'Heavy showers',  icon: '🌧️' },
  95: { label: 'Thunderstorm',   icon: '⛈️' },
  96: { label: 'Thunderstorm',   icon: '⛈️' },
  99: { label: 'Thunderstorm',   icon: '⛈️' },
}

export default function WeatherCard({ destination }) {
  const [state, setState] = useState({ loading: true, error: null, data: null, place: null })

  const load = async () => {
    if (!destination) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`,
      )
      const geo = await geoRes.json()
      const loc = geo?.results?.[0]
      if (!loc) throw new Error('Location not found')

      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`,
      )
      const wx = await wxRes.json()
      setState({
        loading: false,
        error: null,
        data: wx.current,
        place: `${loc.name}${loc.country_code ? `, ${loc.country_code}` : ''}`,
      })
    } catch (err) {
      setState({ loading: false, error: err.message || 'Failed to load weather', data: null, place: null })
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [destination])

  if (!destination) return null

  const wmo = state.data ? WMO[state.data.weather_code] || { label: 'Unknown', icon: '🌍' } : null

  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-brand-300" />
          <h4 className="lower font-display text-sm font-bold">current weather</h4>
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="grid h-7 w-7 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={`h-3 w-3 ${state.loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {state.loading && !state.data && (
        <p className="text-xs text-white/55">Loading...</p>
      )}

      {state.error && (
        <p className="text-xs text-dolly-300">{state.error}</p>
      )}

      {state.data && wmo && (
        <div className="flex items-center gap-4">
          <div className="text-4xl">{wmo.icon}</div>
          <div>
            <div className="font-display text-2xl font-extrabold leading-none">
              {Math.round(state.data.temperature_2m)}°F
            </div>
            <div className="mt-1 text-xs text-white/65">{wmo.label}</div>
            {state.place && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-white/45">
                <MapPin className="h-3 w-3" />
                {state.place}
              </div>
            )}
          </div>
          <div className="ml-auto text-right text-[11px] text-white/55">
            <div>feels like {Math.round(state.data.apparent_temperature)}°</div>
            <div>{Math.round(state.data.wind_speed_10m)} mph wind</div>
          </div>
        </div>
      )}
    </div>
  )
}
