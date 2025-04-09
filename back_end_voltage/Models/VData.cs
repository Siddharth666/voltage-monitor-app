using System.ComponentModel.DataAnnotations;

namespace VoltageData.Models
{
    public class VData
    {
        [Key]
        public int Id { get; set; } // Primary Key

        [Required]
        public string Label { get; set; } // X-Axis Label

        [Required]
        public double Voltage { get; set; } // Y-Axis Value
    }
}
