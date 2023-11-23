using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GroceryBama
{
    class ITEM
    {
        public ITEM() { }
        public int item_id { get; set; }
        public string item_name { get; set; }
        public string food_group { get; set; }
        public string exp_date { get; set; }
        public int quantity { get; set; }
        public double listed_price { get; set; }
        public double wholesale_price { get; set; }
        public string description { get; set; }
    }
}
