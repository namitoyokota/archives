using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    class ORDERR
    {
        public ORDERR() { }
        public int order_id { get; set; }
        public string delivery_instructions { get; set; }
        public string delivery_time { get; set; }
        public string order_placed_date { get; set; }
        public string order_placed_time { get; set; }
    }
}
