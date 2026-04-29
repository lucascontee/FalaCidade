using System.Text.Json.Serialization;

namespace FalaCidade.API.DTO;

public class AddressDTO
{
    [JsonPropertyName("address")]
    public NominatimAddress Address { get; set; }
}

public class NominatimAddress
{
    [JsonPropertyName("road")]
    public string Road { get; set; }

    [JsonPropertyName("suburb")]
    public string Suburb { get; set; }

    [JsonPropertyName("neighbourhood")]
    public string Neighbourhood { get; set; }

    [JsonPropertyName("city")]
    public string City { get; set; }

    [JsonPropertyName("town")]
    public string Town { get; set; }

    [JsonPropertyName("village")]
    public string Village { get; set; }
}