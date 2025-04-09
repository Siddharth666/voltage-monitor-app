using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoltageData.Data;
using VoltageData.Models;

namespace VoltageData.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoltageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VoltageController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VData>>> GetChartData()
        {           
            var voltages = await _context.VoltageReadings.ToListAsync();
            var labels = voltages.Select(w => w.Label).ToList();
            var voltageLevels = voltages.Select(v => v.Voltage);

            return Ok(new { labels, voltageLevels });
        }

        [HttpPost]
        public async Task<ActionResult<VData>> PostChartData(VData data)
        {
            _context.VoltageReadings.Add(data);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetChartData), new { id = data.Id }, data);
        }
    }
}
