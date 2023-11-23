namespace GroceryBama
{
    partial class ListMyItems
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button_order_name = new System.Windows.Forms.Button();
            this.button_back = new System.Windows.Forms.Button();
            this.textAll = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.button_next = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // button_order_name
            // 
            this.button_order_name.Location = new System.Drawing.Point(869, 497);
            this.button_order_name.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_name.Name = "button_order_name";
            this.button_order_name.Size = new System.Drawing.Size(107, 49);
            this.button_order_name.TabIndex = 79;
            this.button_order_name.Text = "Order By Name";
            this.button_order_name.UseVisualStyleBackColor = true;
            this.button_order_name.Click += new System.EventHandler(this.button_order_name_Click_1);
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(17, 497);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 75;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // textAll
            // 
            this.textAll.Location = new System.Drawing.Point(17, 55);
            this.textAll.Multiline = true;
            this.textAll.Name = "textAll";
            this.textAll.ReadOnly = true;
            this.textAll.Size = new System.Drawing.Size(959, 437);
            this.textAll.TabIndex = 72;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(393, 10);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(206, 32);
            this.label3.TabIndex = 71;
            this.label3.Text = "Items In Order";
            // 
            // button_next
            // 
            this.button_next.Location = new System.Drawing.Point(516, 497);
            this.button_next.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_next.Name = "button_next";
            this.button_next.Size = new System.Drawing.Size(107, 49);
            this.button_next.TabIndex = 74;
            this.button_next.Text = "Next";
            this.button_next.UseVisualStyleBackColor = true;
            this.button_next.Click += new System.EventHandler(this.button_next_Click);
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(369, 497);
            this.button2.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(107, 49);
            this.button2.TabIndex = 73;
            this.button2.Text = "Previous";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // ListMyItems
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(993, 556);
            this.Controls.Add(this.button_order_name);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.button_next);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.textAll);
            this.Controls.Add(this.label3);
            this.Name = "ListMyItems";
            this.Text = "ListMyItems";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Button button_order_name;
        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.TextBox textAll;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button button_next;
        private System.Windows.Forms.Button button2;
    }
}