namespace AOHP.Core
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Converts TimeStamp to Local(server) datetime format.
    /// </summary>
    public class JsonDateTimeConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(DateTime);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (reader.Value == null || string.IsNullOrWhiteSpace(Convert.ToString(reader.Value)) || Int64.Parse(reader.Value.ToString()) <= 0)
            {
                return null;
            }

            try
            {
                var t = Convert.ToInt64(reader.Value);

                return new DateTime(1970, 1, 1, 0, 0, 0, 0).AddSeconds(Math.Round(t / 1000d)).ToLocalTime();
            }
            catch (Exception ex)
            {
                Logger.Instance.WriteLog("JsonDateTimeConverter:ReadJson:", ex, Logger.LogTypes.Error);
                return DateTime.MinValue;
            }
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            
        }
    }
}
