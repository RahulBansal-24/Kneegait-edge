/*
 * model_data.h — KneeGait-Edge Compact Random Forest for ESP32
 * Canonical 5 Features: [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]
 * Classes: 0: NORMAL_GAIT, 1: MILD_FUNCTIONAL_RESTRICTION, 2: SEVERE_ANTALGIC_STIFF_GAIT
 */
#ifndef KNEEGAIT_MODEL_DATA_H
#define KNEEGAIT_MODEL_DATA_H

#include <stdint.h>
#include <math.h>

#define KNEEGAIT_NUM_FEATURES 5
#define KNEEGAIT_NUM_CLASSES  3
#define KNEEGAIT_NUM_TREES    20

// Canonical Feature Indices
#define FEAT_PEAK_SWING_FLEXION    0
#define FEAT_SAGITTAL_ROM          1
#define FEAT_STANCE_TO_SWING_RATIO 2
#define FEAT_PEAK_ANGULAR_VELOCITY 3
#define FEAT_CADENCE_SPM           4

// Fixed-Point Scale Multipliers (Q-format)
#define SCALE_PEAK_SWING_FLEXION             100
#define SCALE_SAGITTAL_ROM                   100
#define SCALE_STANCE_TO_SWING_RATIO          1000
#define SCALE_PEAK_ANGULAR_VELOCITY          10
#define SCALE_CADENCE_SPM                    10

// Floating-Point Decision Trees
static inline int _tree_0_predict(const float* f) {
    if (f[0] <= 43.725000f) {
        if (f[1] <= 36.225000f) {
            if (f[2] <= 1.653500f) {
                if (f[3] <= 143.150002f) {
                    if (f[1] <= 28.090000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 32.070000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 98.649998f) {
                    if (f[2] <= 1.798500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 33.475000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[2] <= 1.805500f) {
                if (f[3] <= 105.099998f) {
                    if (f[2] <= 1.660500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.451500f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 38.415001f) {
                    if (f[2] <= 1.951500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 89.549999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[3] <= 187.250000f) {
            if (f[0] <= 55.100000f) {
                if (f[2] <= 1.963500f) {
                    if (f[1] <= 46.835001f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 174.550003f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 50.809999f) {
                    if (f[0] <= 57.285000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 52.210001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[2] <= 1.666500f) {
                if (f[1] <= 45.885000f) {
                    if (f[2] <= 1.484000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 49.150000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[0] <= 52.679998f) {
                    if (f[1] <= 47.680000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 92.550003f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_1_predict(const float* f) {
    if (f[1] <= 37.215000f) {
        if (f[3] <= 158.449997f) {
            if (f[4] <= 92.450001f) {
                if (f[2] <= 1.631500f) {
                    if (f[3] <= 112.850002f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 40.575001f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[0] <= 39.245001f) {
                    if (f[1] <= 28.735000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.818500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[2] <= 1.830000f) {
                if (f[1] <= 32.070000f) {
                    if (f[4] <= 89.700001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 161.400002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 99.750000f) {
                    if (f[4] <= 86.349998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    return 1;
                }
            }
        }
    } else {
        if (f[0] <= 51.504999f) {
            if (f[3] <= 200.849998f) {
                if (f[3] <= 120.750000f) {
                    if (f[2] <= 1.809000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 46.405001f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.594500f) {
                    if (f[4] <= 96.350002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 51.154999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[2] <= 1.673500f) {
                if (f[3] <= 169.250000f) {
                    if (f[1] <= 51.775000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.554500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[1] <= 50.345001f) {
                    if (f[4] <= 103.599998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 104.149998f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_2_predict(const float* f) {
    if (f[0] <= 43.695000f) {
        if (f[1] <= 35.645000f) {
            if (f[2] <= 1.653500f) {
                if (f[0] <= 36.865000f) {
                    if (f[4] <= 90.799999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 32.930000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 32.835001f) {
                    if (f[4] <= 103.200001f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.798500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[3] <= 128.000004f) {
                if (f[4] <= 87.250000f) {
                    if (f[3] <= 121.549999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.831000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.912500f) {
                    if (f[4] <= 81.150002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 99.500000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 52.535000f) {
            if (f[4] <= 106.850002f) {
                if (f[3] <= 203.849998f) {
                    if (f[1] <= 38.400000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 48.635000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.560500f) {
                    if (f[4] <= 108.850002f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 195.500000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[2] <= 1.673500f) {
                if (f[3] <= 158.750000f) {
                    if (f[1] <= 51.949999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 48.199999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[3] <= 193.349998f) {
                    if (f[1] <= 56.934999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 51.565001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_3_predict(const float* f) {
    if (f[1] <= 37.174999f) {
        if (f[1] <= 34.815001f) {
            if (f[3] <= 143.949997f) {
                if (f[2] <= 1.604500f) {
                    if (f[1] <= 31.455000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 89.250000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[4] <= 95.149998f) {
                    if (f[2] <= 1.716500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 36.360001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[4] <= 92.750000f) {
                if (f[2] <= 1.755500f) {
                    if (f[3] <= 103.299999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 83.299999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[3] <= 111.849998f) {
                    if (f[0] <= 41.395000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 146.500000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 52.535000f) {
            if (f[2] <= 1.539500f) {
                if (f[3] <= 186.750000f) {
                    if (f[1] <= 45.400000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 97.149998f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 81.250000f) {
                    if (f[2] <= 1.803500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 121.149998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 48.754999f) {
                if (f[2] <= 1.579000f) {
                    if (f[1] <= 46.049999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 192.650002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[3] <= 148.550003f) {
                    if (f[2] <= 1.594000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 98.649998f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_4_predict(const float* f) {
    if (f[3] <= 149.449997f) {
        if (f[1] <= 37.865000f) {
            if (f[2] <= 1.697500f) {
                if (f[4] <= 91.149998f) {
                    if (f[1] <= 34.825001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 40.295000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 101.350002f) {
                    if (f[1] <= 32.865000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 36.205000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[4] <= 85.850002f) {
                if (f[1] <= 41.740000f) {
                    if (f[4] <= 79.400002f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 120.250000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 51.135000f) {
                    if (f[3] <= 109.799999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 54.175001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 51.525000f) {
            if (f[2] <= 1.482500f) {
                if (f[4] <= 101.149998f) {
                    if (f[3] <= 190.700005f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 186.400002f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[0] <= 38.985001f) {
                    if (f[1] <= 33.100000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 106.149998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[3] <= 185.849998f) {
                if (f[0] <= 55.755001f) {
                    if (f[1] <= 49.510000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 56.700001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 92.049999f) {
                    if (f[1] <= 47.990000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.680500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_5_predict(const float* f) {
    if (f[0] <= 43.695000f) {
        if (f[3] <= 152.349998f) {
            if (f[1] <= 34.805000f) {
                if (f[4] <= 92.450001f) {
                    if (f[2] <= 1.499500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 36.445000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[4] <= 96.850002f) {
                    if (f[1] <= 38.960001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 38.984999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[0] <= 38.240000f) {
                if (f[2] <= 1.717000f) {
                    if (f[4] <= 88.299999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 32.855001f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 33.990000f) {
                    if (f[2] <= 1.710500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 40.494999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[2] <= 1.545500f) {
            if (f[4] <= 93.850002f) {
                if (f[0] <= 52.670000f) {
                    if (f[2] <= 1.400500f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 162.750000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 100.450001f) {
                    if (f[1] <= 46.055000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 48.635000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[0] <= 54.645000f) {
                if (f[2] <= 1.963500f) {
                    if (f[4] <= 82.549999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 162.199997f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.777000f) {
                    if (f[1] <= 51.664999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 107.450001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_6_predict(const float* f) {
    if (f[1] <= 37.225000f) {
        if (f[4] <= 92.750000f) {
            if (f[0] <= 38.019999f) {
                if (f[2] <= 1.435000f) {
                    if (f[3] <= 111.449997f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 89.149998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[3] <= 158.449997f) {
                    if (f[4] <= 83.149998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 80.799999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 33.440001f) {
                if (f[2] <= 1.735500f) {
                    if (f[3] <= 145.049995f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 29.974999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.940500f) {
                    if (f[1] <= 34.429998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 167.400002f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[2] <= 1.559500f) {
            if (f[0] <= 49.535000f) {
                if (f[3] <= 201.699997f) {
                    if (f[4] <= 108.850002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 99.350002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[3] <= 169.349998f) {
                    if (f[4] <= 97.950001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 96.250000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[1] <= 49.500000f) {
                if (f[2] <= 1.957500f) {
                    if (f[4] <= 83.149998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 40.475000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[3] <= 158.650002f) {
                    if (f[0] <= 62.240002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 51.550001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_7_predict(const float* f) {
    if (f[0] <= 43.475000f) {
        if (f[3] <= 152.050003f) {
            if (f[2] <= 1.772500f) {
                if (f[4] <= 89.149998f) {
                    if (f[3] <= 112.000000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 39.199999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 99.750000f) {
                    if (f[2] <= 1.838500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 107.950001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 32.654999f) {
                if (f[0] <= 39.335001f) {
                    if (f[2] <= 1.592500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 89.699997f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 34.959999f) {
                    if (f[4] <= 95.400002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 81.250000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[3] <= 186.250000f) {
            if (f[1] <= 49.570002f) {
                if (f[2] <= 1.976500f) {
                    if (f[4] <= 83.950001f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 49.560001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.554000f) {
                    if (f[3] <= 181.400002f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 50.795000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[0] <= 51.455000f) {
                if (f[4] <= 99.649998f) {
                    if (f[1] <= 45.210001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.595500f) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 96.049999f) {
                    if (f[1] <= 47.924999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.709500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_8_predict(const float* f) {
    if (f[3] <= 144.150002f) {
        if (f[1] <= 39.225000f) {
            if (f[1] <= 34.764999f) {
                if (f[4] <= 104.850002f) {
                    if (f[4] <= 89.549999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 73.299999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.795500f) {
                    if (f[1] <= 37.949999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.953500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[4] <= 85.049999f) {
                if (f[0] <= 48.590000f) {
                    if (f[3] <= 134.750000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.838500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[0] <= 58.850000f) {
                    if (f[4] <= 87.500000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 137.049995f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (f[1] <= 46.164999f) {
            if (f[1] <= 35.129999f) {
                if (f[4] <= 96.450001f) {
                    if (f[4] <= 85.500000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.904000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 43.705000f) {
                    if (f[2] <= 1.434500f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 202.550003f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[3] <= 177.849998f) {
                if (f[2] <= 1.592500f) {
                    if (f[0] <= 54.830000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 105.750000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[1] <= 49.264999f) {
                    if (f[4] <= 96.450001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.772000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_9_predict(const float* f) {
    if (f[1] <= 37.225000f) {
        if (f[1] <= 34.325001f) {
            if (f[2] <= 1.727500f) {
                if (f[1] <= 29.895000f) {
                    if (f[2] <= 1.405500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 88.149998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[3] <= 156.299995f) {
                    if (f[0] <= 40.215000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 32.995001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[3] <= 148.849998f) {
                if (f[2] <= 1.787500f) {
                    if (f[4] <= 80.250000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 92.549999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.860500f) {
                    if (f[4] <= 80.849998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 2.003500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[2] <= 1.569500f) {
            if (f[1] <= 46.075001f) {
                if (f[4] <= 101.149998f) {
                    if (f[3] <= 209.300003f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 175.549995f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[0] <= 54.945000f) {
                    if (f[3] <= 178.299995f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 79.950001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[0] <= 54.684999f) {
                if (f[3] <= 124.149998f) {
                    if (f[0] <= 48.325001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 2.028000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 50.710001f) {
                    if (f[4] <= 105.549999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.770500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_10_predict(const float* f) {
    if (f[1] <= 37.225000f) {
        if (f[4] <= 92.549999f) {
            if (f[1] <= 34.924999f) {
                if (f[1] <= 31.655000f) {
                    if (f[3] <= 139.299995f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.621000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[4] <= 81.400002f) {
                    if (f[3] <= 148.250000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 43.145000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[3] <= 149.000000f) {
                if (f[1] <= 33.549999f) {
                    if (f[2] <= 1.787500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.899500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 32.295000f) {
                    if (f[3] <= 161.349998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 97.649998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[1] <= 46.405001f) {
            if (f[3] <= 208.250000f) {
                if (f[1] <= 38.835001f) {
                    if (f[4] <= 89.549999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 120.399998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[0] <= 47.055000f) {
                    if (f[2] <= 1.475000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 43.230000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[3] <= 176.650002f) {
                if (f[1] <= 50.715000f) {
                    if (f[2] <= 1.504000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 146.599998f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[1] <= 49.355000f) {
                    if (f[1] <= 47.395000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 96.549999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_11_predict(const float* f) {
    if (f[0] <= 42.684999f) {
        if (f[4] <= 96.850002f) {
            if (f[1] <= 36.075001f) {
                if (f[2] <= 1.625500f) {
                    if (f[0] <= 36.884998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 175.250000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 37.525000f) {
                    if (f[2] <= 1.792500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 84.799999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[2] <= 1.788000f) {
                if (f[1] <= 28.300000f) {
                    if (f[0] <= 34.615002f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 32.205000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[0] <= 39.305000f) {
                    if (f[3] <= 157.199997f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 34.889999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[3] <= 189.250000f) {
            if (f[1] <= 50.119999f) {
                if (f[2] <= 1.960500f) {
                    if (f[4] <= 77.950001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 49.545000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.734500f) {
                    if (f[4] <= 101.200001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 50.840000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[4] <= 96.950001f) {
                if (f[2] <= 1.520500f) {
                    if (f[1] <= 47.040001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 49.285000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[0] <= 48.025000f) {
                    if (f[3] <= 203.299995f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 51.655001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_12_predict(const float* f) {
    if (f[2] <= 1.634500f) {
        if (f[4] <= 97.950001f) {
            if (f[0] <= 52.494999f) {
                if (f[1] <= 34.684999f) {
                    if (f[2] <= 1.528500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 200.900002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 48.680000f) {
                    if (f[2] <= 1.438000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.498000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[1] <= 44.230001f) {
                if (f[3] <= 197.150002f) {
                    if (f[0] <= 50.469999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 43.040001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[0] <= 53.100000f) {
                    if (f[4] <= 106.950001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 45.915001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (f[1] <= 37.335001f) {
            if (f[3] <= 158.449997f) {
                if (f[4] <= 103.149998f) {
                    if (f[4] <= 88.649998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 37.840000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 33.465000f) {
                    if (f[4] <= 89.849998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 171.099998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 50.320002f) {
                if (f[3] <= 128.949997f) {
                    if (f[3] <= 101.750000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 83.350002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[3] <= 197.849998f) {
                    if (f[4] <= 96.400002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 98.000000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_13_predict(const float* f) {
    if (f[0] <= 43.495001f) {
        if (f[3] <= 152.050003f) {
            if (f[1] <= 37.215000f) {
                if (f[2] <= 1.760500f) {
                    if (f[0] <= 39.285000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 144.750000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 39.144999f) {
                    if (f[3] <= 125.200001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 86.200001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 34.090000f) {
                if (f[2] <= 1.710500f) {
                    if (f[4] <= 88.250000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 32.190001f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[4] <= 81.250000f) {
                    if (f[2] <= 1.654000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.955000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 52.504999f) {
            if (f[1] <= 45.705000f) {
                if (f[1] <= 38.285000f) {
                    if (f[3] <= 150.049995f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[3] <= 208.250000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.558500f) {
                    if (f[2] <= 1.469500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 105.500000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[4] <= 95.649998f) {
                if (f[0] <= 55.655001f) {
                    if (f[2] <= 1.499000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.674500f) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.763500f) {
                    if (f[2] <= 1.621500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 54.155001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_14_predict(const float* f) {
    if (f[1] <= 37.305000f) {
        if (f[3] <= 152.099998f) {
            if (f[1] <= 32.795000f) {
                if (f[2] <= 1.514500f) {
                    if (f[0] <= 30.634999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.639500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.759500f) {
                    if (f[3] <= 112.750000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.880500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[4] <= 86.900002f) {
                if (f[1] <= 35.385000f) {
                    if (f[3] <= 152.250000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 159.599998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 32.455000f) {
                    if (f[4] <= 101.200001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.865500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 51.934999f) {
            if (f[2] <= 1.534500f) {
                if (f[3] <= 189.650002f) {
                    if (f[1] <= 46.174999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 42.990000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.957500f) {
                    if (f[3] <= 121.500000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 42.404999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 49.594999f) {
                if (f[3] <= 189.050003f) {
                    if (f[2] <= 1.505000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 47.174999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.724500f) {
                    if (f[4] <= 96.350002f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 105.200001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_15_predict(const float* f) {
    if (f[3] <= 143.650002f) {
        if (f[2] <= 1.778500f) {
            if (f[4] <= 88.049999f) {
                if (f[1] <= 37.600000f) {
                    if (f[2] <= 1.552500f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 73.000000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 34.189999f) {
                    if (f[1] <= 28.700000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 53.135000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[2] <= 1.835500f) {
                if (f[4] <= 85.950001f) {
                    if (f[3] <= 130.700005f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 43.380001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 41.025000f) {
                    if (f[1] <= 38.985001f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 2.027000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[0] <= 52.535000f) {
            if (f[3] <= 201.500000f) {
                if (f[0] <= 39.430000f) {
                    if (f[1] <= 32.670000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 107.950001f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 99.350002f) {
                    if (f[0] <= 49.495001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 218.250000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[3] <= 181.400002f) {
                if (f[1] <= 50.395000f) {
                    if (f[4] <= 105.400002f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 97.750000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 96.250000f) {
                    if (f[3] <= 195.450005f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 55.390001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_16_predict(const float* f) {
    if (f[1] <= 37.315001f) {
        if (f[4] <= 93.450001f) {
            if (f[1] <= 34.985001f) {
                if (f[3] <= 182.950005f) {
                    if (f[0] <= 39.664999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 41.255001f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.757500f) {
                    if (f[4] <= 81.049999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 36.924999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[3] <= 146.500000f) {
                if (f[2] <= 1.820000f) {
                    if (f[0] <= 40.365002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.951000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[1] <= 31.345000f) {
                    if (f[2] <= 1.758000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 97.349998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[1] <= 46.875000f) {
            if (f[3] <= 203.949997f) {
                if (f[3] <= 124.049999f) {
                    if (f[2] <= 1.779000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 186.400002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 99.750000f) {
                    if (f[4] <= 92.000000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 42.219999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[3] <= 182.550003f) {
                if (f[2] <= 1.573000f) {
                    if (f[4] <= 90.049999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 52.470001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 96.350002f) {
                    if (f[2] <= 1.529500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[2] <= 1.709500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_17_predict(const float* f) {
    if (f[3] <= 143.949997f) {
        if (f[0] <= 43.699999f) {
            if (f[2] <= 1.625500f) {
                if (f[4] <= 83.049999f) {
                    if (f[3] <= 117.899998f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[3] <= 117.299999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.791500f) {
                    if (f[1] <= 34.855000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[4] <= 94.549999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (f[2] <= 1.838500f) {
                if (f[3] <= 105.400002f) {
                    if (f[4] <= 88.100002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 52.430000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[4] <= 86.850002f) {
                    if (f[0] <= 51.310001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 47.505001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[3] <= 186.849998f) {
            if (f[1] <= 49.510000f) {
                if (f[1] <= 34.985001f) {
                    if (f[2] <= 1.716500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.465500f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.596500f) {
                    if (f[1] <= 52.210001f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 59.280001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[0] <= 48.295000f) {
                if (f[4] <= 104.950001f) {
                    if (f[4] <= 98.750000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 42.225000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.598500f) {
                    if (f[1] <= 46.105000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 52.519999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_18_predict(const float* f) {
    if (f[1] <= 37.215000f) {
        if (f[2] <= 1.712500f) {
            if (f[0] <= 38.980001f) {
                if (f[3] <= 160.849998f) {
                    if (f[4] <= 93.149998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 33.394999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[3] <= 110.799999f) {
                    if (f[4] <= 88.599998f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 82.650002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[3] <= 152.099998f) {
                if (f[4] <= 92.450001f) {
                    if (f[0] <= 38.025000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 40.105000f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[4] <= 88.299999f) {
                    if (f[2] <= 1.732000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 37.655001f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[3] <= 189.849998f) {
            if (f[0] <= 54.945000f) {
                if (f[2] <= 1.970500f) {
                    if (f[4] <= 107.750000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 42.775000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.674500f) {
                    if (f[1] <= 50.799999f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 103.899998f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[1] <= 44.985001f) {
                if (f[2] <= 1.533500f) {
                    if (f[4] <= 92.799999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 215.150002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[2] <= 1.778500f) {
                    if (f[2] <= 1.571500f) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[1] <= 57.655001f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_19_predict(const float* f) {
    if (f[1] <= 37.145000f) {
        if (f[3] <= 158.449997f) {
            if (f[4] <= 93.549999f) {
                if (f[0] <= 40.865000f) {
                    if (f[2] <= 1.435500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[1] <= 36.924999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (f[2] <= 1.788000f) {
                    if (f[1] <= 30.975000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 36.369999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 32.295000f) {
                if (f[2] <= 1.710500f) {
                    if (f[4] <= 78.650002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[4] <= 100.549999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 88.000000f) {
                    if (f[2] <= 1.795500f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 37.340000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (f[1] <= 47.300001f) {
            if (f[2] <= 1.473500f) {
                if (f[4] <= 95.850002f) {
                    if (f[4] <= 93.850002f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 43.125000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.949500f) {
                    if (f[3] <= 208.250000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 91.750000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[3] <= 176.299995f) {
                if (f[4] <= 99.750000f) {
                    if (f[2] <= 1.485500f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.580000f) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 49.355000f) {
                    if (f[2] <= 1.655500f) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 51.545000f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

// Fixed-Point (int16_t) Decision Trees
static inline int _tree_0_predict_fixed(const int16_t* q) {
    if (q[0] <= 4373) {
        if (q[1] <= 3623) {
            if (q[2] <= 1654) {
                if (q[3] <= 1432) {
                    if (q[1] <= 2809) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3207) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 986) {
                    if (q[2] <= 1799) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3348) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[2] <= 1805) {
                if (q[3] <= 1051) {
                    if (q[2] <= 1660) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1451) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3842) {
                    if (q[2] <= 1951) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 895) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[3] <= 1872) {
            if (q[0] <= 5510) {
                if (q[2] <= 1964) {
                    if (q[1] <= 4684) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1746) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 5081) {
                    if (q[0] <= 5728) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5221) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[2] <= 1667) {
                if (q[1] <= 4589) {
                    if (q[2] <= 1484) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4915) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[0] <= 5268) {
                    if (q[1] <= 4768) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 926) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_1_predict_fixed(const int16_t* q) {
    if (q[1] <= 3722) {
        if (q[3] <= 1584) {
            if (q[4] <= 925) {
                if (q[2] <= 1632) {
                    if (q[3] <= 1129) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4058) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[0] <= 3925) {
                    if (q[1] <= 2873) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1818) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[2] <= 1830) {
                if (q[1] <= 3207) {
                    if (q[4] <= 897) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1614) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 998) {
                    if (q[4] <= 863) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    return 1;
                }
            }
        }
    } else {
        if (q[0] <= 5150) {
            if (q[3] <= 2008) {
                if (q[3] <= 1208) {
                    if (q[2] <= 1809) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 4641) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1595) {
                    if (q[4] <= 964) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5115) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[2] <= 1674) {
                if (q[3] <= 1692) {
                    if (q[1] <= 5177) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1554) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[1] <= 5035) {
                    if (q[4] <= 1036) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 1041) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_2_predict_fixed(const int16_t* q) {
    if (q[0] <= 4369) {
        if (q[1] <= 3565) {
            if (q[2] <= 1654) {
                if (q[0] <= 3686) {
                    if (q[4] <= 908) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3293) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3284) {
                    if (q[4] <= 1032) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1799) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[3] <= 1280) {
                if (q[4] <= 872) {
                    if (q[3] <= 1215) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1831) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1912) {
                    if (q[4] <= 812) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 995) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5253) {
            if (q[4] <= 1069) {
                if (q[3] <= 2038) {
                    if (q[1] <= 3840) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4864) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1560) {
                    if (q[4] <= 1089) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 1955) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[2] <= 1674) {
                if (q[3] <= 1588) {
                    if (q[1] <= 5195) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 4820) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[3] <= 1933) {
                    if (q[1] <= 5693) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5157) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_3_predict_fixed(const int16_t* q) {
    if (q[1] <= 3717) {
        if (q[1] <= 3482) {
            if (q[3] <= 1439) {
                if (q[2] <= 1604) {
                    if (q[1] <= 3145) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 892) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[4] <= 951) {
                    if (q[2] <= 1717) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3636) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[4] <= 928) {
                if (q[2] <= 1756) {
                    if (q[3] <= 1033) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 833) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[3] <= 1118) {
                    if (q[0] <= 4140) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1465) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5253) {
            if (q[2] <= 1539) {
                if (q[3] <= 1868) {
                    if (q[1] <= 4540) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 971) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 812) {
                    if (q[2] <= 1803) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1211) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 4875) {
                if (q[2] <= 1579) {
                    if (q[1] <= 4605) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 1927) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[3] <= 1486) {
                    if (q[2] <= 1594) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 986) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_4_predict_fixed(const int16_t* q) {
    if (q[3] <= 1494) {
        if (q[1] <= 3786) {
            if (q[2] <= 1697) {
                if (q[4] <= 911) {
                    if (q[1] <= 3483) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4030) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 1014) {
                    if (q[1] <= 3286) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3620) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[4] <= 859) {
                if (q[1] <= 4174) {
                    if (q[4] <= 794) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1202) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 5114) {
                    if (q[3] <= 1098) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 5418) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5152) {
            if (q[2] <= 1483) {
                if (q[4] <= 1011) {
                    if (q[3] <= 1907) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 1864) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[0] <= 3899) {
                    if (q[1] <= 3310) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 1061) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[3] <= 1858) {
                if (q[0] <= 5576) {
                    if (q[1] <= 4951) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5670) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 920) {
                    if (q[1] <= 4799) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1680) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_5_predict_fixed(const int16_t* q) {
    if (q[0] <= 4369) {
        if (q[3] <= 1523) {
            if (q[1] <= 3481) {
                if (q[4] <= 925) {
                    if (q[2] <= 1499) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3644) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[4] <= 969) {
                    if (q[1] <= 3896) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 3898) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[0] <= 3824) {
                if (q[2] <= 1717) {
                    if (q[4] <= 883) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3286) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 3399) {
                    if (q[2] <= 1711) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 4049) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[2] <= 1545) {
            if (q[4] <= 939) {
                if (q[0] <= 5267) {
                    if (q[2] <= 1400) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1628) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 1005) {
                    if (q[1] <= 4606) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 4864) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[0] <= 5465) {
                if (q[2] <= 1964) {
                    if (q[4] <= 825) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1622) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1777) {
                    if (q[1] <= 5166) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 1075) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_6_predict_fixed(const int16_t* q) {
    if (q[1] <= 3723) {
        if (q[4] <= 928) {
            if (q[0] <= 3802) {
                if (q[2] <= 1435) {
                    if (q[3] <= 1114) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 891) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[3] <= 1584) {
                    if (q[4] <= 831) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 808) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 3344) {
                if (q[2] <= 1735) {
                    if (q[3] <= 1450) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 2997) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1941) {
                    if (q[1] <= 3443) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1674) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[2] <= 1559) {
            if (q[0] <= 4953) {
                if (q[3] <= 2017) {
                    if (q[4] <= 1089) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 994) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[3] <= 1693) {
                    if (q[4] <= 980) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 962) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[1] <= 4950) {
                if (q[2] <= 1957) {
                    if (q[4] <= 831) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4048) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[3] <= 1587) {
                    if (q[0] <= 6224) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5155) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_7_predict_fixed(const int16_t* q) {
    if (q[0] <= 4348) {
        if (q[3] <= 1521) {
            if (q[2] <= 1772) {
                if (q[4] <= 891) {
                    if (q[3] <= 1120) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3920) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 998) {
                    if (q[2] <= 1839) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 1080) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 3265) {
                if (q[0] <= 3934) {
                    if (q[2] <= 1592) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 897) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3496) {
                    if (q[4] <= 954) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 812) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[3] <= 1862) {
            if (q[1] <= 4957) {
                if (q[2] <= 1976) {
                    if (q[4] <= 840) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4956) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1554) {
                    if (q[3] <= 1814) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5080) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[0] <= 5145) {
                if (q[4] <= 996) {
                    if (q[1] <= 4521) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1595) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 960) {
                    if (q[1] <= 4792) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1709) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_8_predict_fixed(const int16_t* q) {
    if (q[3] <= 1442) {
        if (q[1] <= 3923) {
            if (q[1] <= 3476) {
                if (q[4] <= 1049) {
                    if (q[4] <= 895) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 733) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1796) {
                    if (q[1] <= 3795) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1953) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[4] <= 850) {
                if (q[0] <= 4859) {
                    if (q[3] <= 1348) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1839) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[0] <= 5885) {
                    if (q[4] <= 875) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1370) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (q[1] <= 4616) {
            if (q[1] <= 3513) {
                if (q[4] <= 965) {
                    if (q[4] <= 855) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1904) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 4370) {
                    if (q[2] <= 1434) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 2026) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[3] <= 1778) {
                if (q[2] <= 1593) {
                    if (q[0] <= 5483) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 1058) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[1] <= 4926) {
                    if (q[4] <= 965) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1772) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_9_predict_fixed(const int16_t* q) {
    if (q[1] <= 3723) {
        if (q[1] <= 3433) {
            if (q[2] <= 1728) {
                if (q[1] <= 2989) {
                    if (q[2] <= 1405) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 881) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[3] <= 1563) {
                    if (q[0] <= 4022) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3300) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[3] <= 1488) {
                if (q[2] <= 1787) {
                    if (q[4] <= 802) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 925) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1860) {
                    if (q[4] <= 808) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 2003) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[2] <= 1570) {
            if (q[1] <= 4608) {
                if (q[4] <= 1011) {
                    if (q[3] <= 2093) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1755) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[0] <= 5494) {
                    if (q[3] <= 1783) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 800) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[0] <= 5468) {
                if (q[3] <= 1241) {
                    if (q[0] <= 4833) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 2028) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 5071) {
                    if (q[4] <= 1055) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1771) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_10_predict_fixed(const int16_t* q) {
    if (q[1] <= 3723) {
        if (q[4] <= 925) {
            if (q[1] <= 3492) {
                if (q[1] <= 3165) {
                    if (q[3] <= 1393) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1621) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[4] <= 814) {
                    if (q[3] <= 1482) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4315) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[3] <= 1490) {
                if (q[1] <= 3355) {
                    if (q[2] <= 1788) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1900) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 3230) {
                    if (q[3] <= 1613) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 976) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[1] <= 4641) {
            if (q[3] <= 2082) {
                if (q[1] <= 3884) {
                    if (q[4] <= 895) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1204) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[0] <= 4706) {
                    if (q[2] <= 1475) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4323) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[3] <= 1767) {
                if (q[1] <= 5072) {
                    if (q[2] <= 1504) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1466) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[1] <= 4935) {
                    if (q[1] <= 4740) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 965) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_11_predict_fixed(const int16_t* q) {
    if (q[0] <= 4268) {
        if (q[4] <= 969) {
            if (q[1] <= 3608) {
                if (q[2] <= 1626) {
                    if (q[0] <= 3688) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 1752) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3752) {
                    if (q[2] <= 1793) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 848) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[2] <= 1788) {
                if (q[1] <= 2830) {
                    if (q[0] <= 3462) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3220) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[0] <= 3931) {
                    if (q[3] <= 1572) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3489) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[3] <= 1892) {
            if (q[1] <= 5012) {
                if (q[2] <= 1961) {
                    if (q[4] <= 780) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4955) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1734) {
                    if (q[4] <= 1012) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5084) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[4] <= 970) {
                if (q[2] <= 1521) {
                    if (q[1] <= 4704) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 4928) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[0] <= 4802) {
                    if (q[3] <= 2033) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5166) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_12_predict_fixed(const int16_t* q) {
    if (q[2] <= 1634) {
        if (q[4] <= 980) {
            if (q[0] <= 5249) {
                if (q[1] <= 3468) {
                    if (q[2] <= 1528) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 2009) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 4868) {
                    if (q[2] <= 1438) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1498) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[1] <= 4423) {
                if (q[3] <= 1972) {
                    if (q[0] <= 5047) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 4304) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[0] <= 5310) {
                    if (q[4] <= 1070) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 4592) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    } else {
        if (q[1] <= 3734) {
            if (q[3] <= 1584) {
                if (q[4] <= 1031) {
                    if (q[4] <= 886) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3784) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3347) {
                    if (q[4] <= 898) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1711) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 5032) {
                if (q[3] <= 1289) {
                    if (q[3] <= 1018) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 834) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[3] <= 1978) {
                    if (q[4] <= 964) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 980) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_13_predict_fixed(const int16_t* q) {
    if (q[0] <= 4350) {
        if (q[3] <= 1521) {
            if (q[1] <= 3722) {
                if (q[2] <= 1761) {
                    if (q[0] <= 3928) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1448) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 3914) {
                    if (q[3] <= 1252) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 862) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 3409) {
                if (q[2] <= 1711) {
                    if (q[4] <= 882) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3219) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[4] <= 812) {
                    if (q[2] <= 1654) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1955) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5250) {
            if (q[1] <= 4570) {
                if (q[1] <= 3828) {
                    if (q[3] <= 1500) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[3] <= 2082) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1558) {
                    if (q[2] <= 1470) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 1055) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[4] <= 956) {
                if (q[0] <= 5566) {
                    if (q[2] <= 1499) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1674) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1764) {
                    if (q[2] <= 1622) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5416) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_14_predict_fixed(const int16_t* q) {
    if (q[1] <= 3731) {
        if (q[3] <= 1521) {
            if (q[1] <= 3280) {
                if (q[2] <= 1515) {
                    if (q[0] <= 3063) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1640) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1759) {
                    if (q[3] <= 1128) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1881) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[4] <= 869) {
                if (q[1] <= 3539) {
                    if (q[3] <= 1522) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1596) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3245) {
                    if (q[4] <= 1012) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1866) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5193) {
            if (q[2] <= 1535) {
                if (q[3] <= 1897) {
                    if (q[1] <= 4617) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 4299) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1957) {
                    if (q[3] <= 1215) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4240) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 4959) {
                if (q[3] <= 1891) {
                    if (q[2] <= 1505) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4717) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1725) {
                    if (q[4] <= 964) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 1052) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_15_predict_fixed(const int16_t* q) {
    if (q[3] <= 1437) {
        if (q[2] <= 1779) {
            if (q[4] <= 880) {
                if (q[1] <= 3760) {
                    if (q[2] <= 1553) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 730) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3419) {
                    if (q[1] <= 2870) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 5314) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[2] <= 1836) {
                if (q[4] <= 860) {
                    if (q[3] <= 1307) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4338) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 4102) {
                    if (q[1] <= 3899) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 2027) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[0] <= 5253) {
            if (q[3] <= 2015) {
                if (q[0] <= 3943) {
                    if (q[1] <= 3267) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 1080) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 994) {
                    if (q[0] <= 4950) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 2182) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[3] <= 1814) {
                if (q[1] <= 5040) {
                    if (q[4] <= 1054) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 978) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 962) {
                    if (q[3] <= 1955) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5539) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_16_predict_fixed(const int16_t* q) {
    if (q[1] <= 3732) {
        if (q[4] <= 935) {
            if (q[1] <= 3499) {
                if (q[3] <= 1830) {
                    if (q[0] <= 3966) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4126) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1757) {
                    if (q[4] <= 810) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3692) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[3] <= 1465) {
                if (q[2] <= 1820) {
                    if (q[0] <= 4037) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1951) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[1] <= 3135) {
                    if (q[2] <= 1758) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 973) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[1] <= 4688) {
            if (q[3] <= 2039) {
                if (q[3] <= 1240) {
                    if (q[2] <= 1779) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1864) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 998) {
                    if (q[4] <= 920) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4222) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[3] <= 1826) {
                if (q[2] <= 1573) {
                    if (q[4] <= 900) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5247) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 964) {
                    if (q[2] <= 1530) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[2] <= 1709) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_17_predict_fixed(const int16_t* q) {
    if (q[3] <= 1439) {
        if (q[0] <= 4370) {
            if (q[2] <= 1626) {
                if (q[4] <= 830) {
                    if (q[3] <= 1179) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[3] <= 1173) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1792) {
                    if (q[1] <= 3485) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[4] <= 945) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            }
        } else {
            if (q[2] <= 1839) {
                if (q[3] <= 1054) {
                    if (q[4] <= 881) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 5243) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[4] <= 869) {
                    if (q[0] <= 5131) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4751) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[3] <= 1868) {
            if (q[1] <= 4951) {
                if (q[1] <= 3499) {
                    if (q[2] <= 1717) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1465) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1596) {
                    if (q[1] <= 5221) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5928) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[0] <= 4830) {
                if (q[4] <= 1050) {
                    if (q[4] <= 988) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4223) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1599) {
                    if (q[1] <= 4610) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 5252) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_18_predict_fixed(const int16_t* q) {
    if (q[1] <= 3722) {
        if (q[2] <= 1713) {
            if (q[0] <= 3898) {
                if (q[3] <= 1608) {
                    if (q[4] <= 931) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3339) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[3] <= 1108) {
                    if (q[4] <= 886) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 827) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[3] <= 1521) {
                if (q[4] <= 925) {
                    if (q[0] <= 3802) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4010) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[4] <= 883) {
                    if (q[2] <= 1732) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3766) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[3] <= 1898) {
            if (q[0] <= 5494) {
                if (q[2] <= 1970) {
                    if (q[4] <= 1078) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4277) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1674) {
                    if (q[1] <= 5080) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 1039) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[1] <= 4499) {
                if (q[2] <= 1534) {
                    if (q[4] <= 928) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 2152) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[2] <= 1779) {
                    if (q[2] <= 1572) {
                        return 0;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[1] <= 5766) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}

static inline int _tree_19_predict_fixed(const int16_t* q) {
    if (q[1] <= 3715) {
        if (q[3] <= 1584) {
            if (q[4] <= 935) {
                if (q[0] <= 4086) {
                    if (q[2] <= 1435) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[1] <= 3692) {
                        return 2;
                    } else {
                        return 2;
                    }
                }
            } else {
                if (q[2] <= 1788) {
                    if (q[1] <= 3098) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 3637) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 3230) {
                if (q[2] <= 1711) {
                    if (q[4] <= 787) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[4] <= 1005) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 880) {
                    if (q[2] <= 1795) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 3734) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        if (q[1] <= 4730) {
            if (q[2] <= 1474) {
                if (q[4] <= 959) {
                    if (q[4] <= 939) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4312) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1950) {
                    if (q[3] <= 2082) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 918) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[3] <= 1763) {
                if (q[4] <= 998) {
                    if (q[2] <= 1485) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1580) {
                        return 0;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 4935) {
                    if (q[2] <= 1655) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 5155) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
}


/**
 * @brief Predicts 3-class gait impairment using majority ensemble vote.
 * @param features Array of 5 floats in canonical order:
 *                 [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]
 * @return Class ID: 0 (NORMAL_GAIT), 1 (MILD_FUNCTIONAL_RESTRICTION), 2 (SEVERE_ANTALGIC_STIFF_GAIT).
 */
static inline int kneegait_predict(const float* features) {
    if (features == 0) return -1;
    for (int i = 0; i < KNEEGAIT_NUM_FEATURES; ++i) {
        if (isnan(features[i]) || isinf(features[i])) return -1;
    }
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};

    votes[_tree_0_predict(features)]++;
    votes[_tree_1_predict(features)]++;
    votes[_tree_2_predict(features)]++;
    votes[_tree_3_predict(features)]++;
    votes[_tree_4_predict(features)]++;
    votes[_tree_5_predict(features)]++;
    votes[_tree_6_predict(features)]++;
    votes[_tree_7_predict(features)]++;
    votes[_tree_8_predict(features)]++;
    votes[_tree_9_predict(features)]++;
    votes[_tree_10_predict(features)]++;
    votes[_tree_11_predict(features)]++;
    votes[_tree_12_predict(features)]++;
    votes[_tree_13_predict(features)]++;
    votes[_tree_14_predict(features)]++;
    votes[_tree_15_predict(features)]++;
    votes[_tree_16_predict(features)]++;
    votes[_tree_17_predict(features)]++;
    votes[_tree_18_predict(features)]++;
    votes[_tree_19_predict(features)]++;

    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

/**
 * @brief Fixed-point int16 inference API for memory-constrained ESP32 operation.
 */
static inline int kneegait_predict_fixed(const int16_t* features_q) {
    if (features_q == 0) return -1;
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};

    votes[_tree_0_predict_fixed(features_q)]++;
    votes[_tree_1_predict_fixed(features_q)]++;
    votes[_tree_2_predict_fixed(features_q)]++;
    votes[_tree_3_predict_fixed(features_q)]++;
    votes[_tree_4_predict_fixed(features_q)]++;
    votes[_tree_5_predict_fixed(features_q)]++;
    votes[_tree_6_predict_fixed(features_q)]++;
    votes[_tree_7_predict_fixed(features_q)]++;
    votes[_tree_8_predict_fixed(features_q)]++;
    votes[_tree_9_predict_fixed(features_q)]++;
    votes[_tree_10_predict_fixed(features_q)]++;
    votes[_tree_11_predict_fixed(features_q)]++;
    votes[_tree_12_predict_fixed(features_q)]++;
    votes[_tree_13_predict_fixed(features_q)]++;
    votes[_tree_14_predict_fixed(features_q)]++;
    votes[_tree_15_predict_fixed(features_q)]++;
    votes[_tree_16_predict_fixed(features_q)]++;
    votes[_tree_17_predict_fixed(features_q)]++;
    votes[_tree_18_predict_fixed(features_q)]++;
    votes[_tree_19_predict_fixed(features_q)]++;

    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

static inline const char* kneegait_get_class_name(int class_id) {
    switch(class_id) {
        case 0: return "NORMAL_GAIT";
        case 1: return "MILD_FUNCTIONAL_RESTRICTION";
        case 2: return "SEVERE_ANTALGIC_STIFF_GAIT";
        default: return "UNKNOWN";
    }
}

static inline const char* kneegait_get_display_label(int class_id) {
    switch(class_id) {
        case 0: return "Normal / Healthy";
        case 1: return "Mild Functional Restriction";
        case 2: return "Severe Antalgic / Stiff Gait";
        default: return "Invalid";
    }
}

/* =========================================================================
 * CONTINUOUS STREAMING FIFO BUFFER & ON-DEVICE STRIDE PROCESSOR
 * ========================================================================= */

#define KNEEGAIT_FIFO_CAPACITY         150    // ~3.0s buffer at 50Hz (fits 0.55s - 2.4s strides)
#define KNEEGAIT_MIN_STRIDE_S          0.55f  // Min duration (cadence <= 218 spm)
#define KNEEGAIT_MAX_STRIDE_S          2.40f  // Max duration (cadence >= 50 spm)
#define KNEEGAIT_REFRACTORY_S          0.40f  // Refractory deadtime after foot strike (prevents bounce)
#define KNEEGAIT_IMPACT_THRESHOLD_G    1.45f  // Shank deceleration impact threshold for heel strike
#define KNEEGAIT_STALE_TIMEOUT_S       2.00f  // Gap threshold to auto-reset FIFO buffer

/**
 * @brief Raw timestamped IMU sample from hardware.
 */
typedef struct {
    float t;            // Timestamp in seconds
    float flexion;      // Knee joint sagittal flexion angle (degrees)
    float ang_vel;      // Angular velocity (deg/s)
    float accel_z;      // Shank vertical acceleration (g)
} kneegait_sample_t;

/**
 * @brief Segmented stride classification event output.
 */
typedef struct {
    int has_stride;                         // 1 if a stride was completed and classified, 0 otherwise
    int class_id;                           // 0: NORMAL, 1: MILD, 2: SEVERE
    const char* class_name;                 // "NORMAL_GAIT", etc.
    const char* display_label;              // "Normal / Healthy", etc.
    float features[KNEEGAIT_NUM_FEATURES];  // Canonical 5 features
    float stride_duration_s;                // Duration of completed stride in seconds
    float cadence_spm;                      // Step cadence in steps/min
    uint32_t stride_count;                  // Total valid strides detected
} kneegait_stride_result_t;

/**
 * @brief Continuous streaming FIFO pipeline state.
 */
typedef struct {
    kneegait_sample_t buffer[KNEEGAIT_FIFO_CAPACITY];
    int head;                               // Circular buffer write index
    int count;                              // Current number of samples in FIFO
    float last_sample_t;                    // Timestamp of previous sample
    float last_hs_t;                        // Timestamp of last detected heel-strike
    int has_first_hs;                       // Flag indicating initial heel-strike established
    uint32_t total_strides;                 // Running counter of segmented strides
} kneegait_pipeline_t;

/**
 * @brief Initializes or resets the continuous streaming FIFO pipeline.
 */
static inline void kneegait_pipeline_init(kneegait_pipeline_t* pipe) {
    if (!pipe) return;
    pipe->head = 0;
    pipe->count = 0;
    pipe->last_sample_t = -1.0f;
    pipe->last_hs_t = -1.0f;
    pipe->has_first_hs = 0;
    pipe->total_strides = 0;
}

/**
 * @brief Processes a single continuous hardware sample at 50Hz.
 * 
 * Ingests raw hardware readings into the internal FIFO ring buffer, tracks
 * gait cycle events (heel-strike impact / terminal extension), segments valid
 * complete strides, computes the 5 canonical features, and executes inference.
 * 
 * @param pipe Pointer to active pipeline state.
 * @param t_sec Sample timestamp in seconds.
 * @param knee_flexion Sagittal knee flexion in degrees.
 * @param accel_z Shank vertical acceleration in g (pass 0.0f if uninstrumented).
 * @param out_result Output struct populated when a full stride cycle completes.
 * @return 1 if a stride was completed and classified, 0 if still buffering.
 */
static inline int kneegait_process_sample(
    kneegait_pipeline_t* pipe,
    float t_sec,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    if (!pipe || !out_result) return 0;
    out_result->has_stride = 0;

    // Check for timestamps going backward or duplicate
    if (pipe->last_sample_t >= 0.0f) {
        float dt = t_sec - pipe->last_sample_t;
        if (dt <= 0.0f) {
            return 0; // Ignore duplicate or out-of-order sample
        }
        // If data stream was interrupted (> 2s), reset buffer
        if (dt > KNEEGAIT_STALE_TIMEOUT_S) {
            kneegait_pipeline_init(pipe);
        }
    }

    // Estimate angular velocity from previous sample in FIFO if available
    float ang_vel = 0.0f;
    if (pipe->count > 0) {
        int prev_idx = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float dt = t_sec - pipe->buffer[prev_idx].t;
        if (dt > 0.0001f) {
            ang_vel = (knee_flexion - pipe->buffer[prev_idx].flexion) / dt;
        }
    }

    // Push new sample into circular FIFO
    pipe->buffer[pipe->head].t = t_sec;
    pipe->buffer[pipe->head].flexion = knee_flexion;
    pipe->buffer[pipe->head].ang_vel = ang_vel;
    pipe->buffer[pipe->head].accel_z = accel_z;

    pipe->head = (pipe->head + 1) % KNEEGAIT_FIFO_CAPACITY;
    if (pipe->count < KNEEGAIT_FIFO_CAPACITY) {
        pipe->count++;
    }
    pipe->last_sample_t = t_sec;

    // Detect Heel-Strike (Initial Contact):
    // 1. Primary: Shank deceleration impact spike (accel_z >= 1.45g)
    // 2. Fallback (if accel_z unmeasured): Local minimum of flexion (< 15.0 deg) after swing
    int is_heel_strike = 0;
    if (accel_z >= KNEEGAIT_IMPACT_THRESHOLD_G) {
        is_heel_strike = 1;
    } else if (accel_z <= 0.0f && pipe->count >= 3) {
        int i1 = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i2 = (pipe->head - 2 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i3 = (pipe->head - 3 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        if (pipe->buffer[i2].flexion < 15.0f &&
            pipe->buffer[i2].flexion <= pipe->buffer[i3].flexion &&
            pipe->buffer[i2].flexion <= pipe->buffer[i1].flexion) {
            is_heel_strike = 1;
        }
    }

    if (!is_heel_strike) {
        return 0;
    }

    // Apply refractory period (prevent bounce double-triggering)
    if (pipe->has_first_hs && (t_sec - pipe->last_hs_t) < KNEEGAIT_REFRACTORY_S) {
        return 0;
    }

    // If first heel-strike, establish baseline and wait for second heel-strike
    if (!pipe->has_first_hs) {
        pipe->has_first_hs = 1;
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Second heel-strike detected: complete stride candidate
    float stride_dur = t_sec - pipe->last_hs_t;

    // Check physiological duration bounds [0.55s, 2.40s]
    if (stride_dur < KNEEGAIT_MIN_STRIDE_S || stride_dur > KNEEGAIT_MAX_STRIDE_S) {
        // Invalid duration: reset baseline to current foot strike
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Extract 5 canonical features across the stride interval [last_hs_t, t_sec]
    float max_flex = -999.0f;
    float min_flex = 999.0f;
    float max_ang_vel = 0.0f;
    float toe_off_t = pipe->last_hs_t + (0.60f * stride_dur); // Default ~60% stance phase

    int n_stride_samples = 0;
    float valley_min = 999.0f;
    float valley_t = toe_off_t;

    // Iterate through FIFO to inspect stride samples
    for (int i = 0; i < pipe->count; ++i) {
        int idx = (pipe->head - 1 - i + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float st = pipe->buffer[idx].t;
        if (st < pipe->last_hs_t) break;
        if (st > t_sec) continue;

        float flex = pipe->buffer[idx].flexion;
        float vel = fabsf(pipe->buffer[idx].ang_vel);

        if (flex > max_flex) max_flex = flex;
        if (flex < min_flex) min_flex = flex;
        if (vel > max_ang_vel) max_ang_vel = vel;

        // Track inflection for toe-off (local minimum between 40% and 70% phase)
        float phase = (st - pipe->last_hs_t) / stride_dur;
        if (phase >= 0.40f && phase <= 0.70f) {
            if (flex < valley_min) {
                valley_min = flex;
                valley_t = st;
            }
        }
        n_stride_samples++;
    }

    if (n_stride_samples < 5) {
        pipe->last_hs_t = t_sec;
        return 0;
    }

    if (valley_min < 990.0f) {
        toe_off_t = valley_t;
    }

    float t_stance = toe_off_t - pipe->last_hs_t;
    float t_swing = t_sec - toe_off_t;
    if (t_stance <= 0.05f) t_stance = 0.60f * stride_dur;
    if (t_swing <= 0.05f) t_swing = 0.40f * stride_dur;

    float stance_to_swing = t_stance / t_swing;
    if (stance_to_swing < 1.0f) stance_to_swing = 1.0f;
    if (stance_to_swing > 3.0f) stance_to_swing = 3.0f;

    float cadence_spm = 2.0f * (60.0f / stride_dur);

    // Populate Canonical Features
    out_result->features[FEAT_PEAK_SWING_FLEXION]    = max_flex;
    out_result->features[FEAT_SAGITTAL_ROM]          = max_flex - min_flex;
    out_result->features[FEAT_STANCE_TO_SWING_RATIO] = stance_to_swing;
    out_result->features[FEAT_PEAK_ANGULAR_VELOCITY] = max_ang_vel;
    out_result->features[FEAT_CADENCE_SPM]           = cadence_spm;

    // Run On-Device Random Forest Classifier Directly
    int pred_class = kneegait_predict(out_result->features);
    out_result->has_stride = 1;
    out_result->class_id = pred_class;
    out_result->class_name = kneegait_get_class_name(pred_class);
    out_result->display_label = kneegait_get_display_label(pred_class);
    out_result->stride_duration_s = stride_dur;
    out_result->cadence_spm = cadence_spm;

    pipe->total_strides++;
    out_result->stride_count = pipe->total_strides;

    // Advance stride window: current heel-strike becomes start of next stride
    pipe->last_hs_t = t_sec;

    return 1;
}

/**
 * @brief Millisecond timestamp convenience wrapper for Arduino / ESP32.
 */
static inline int kneegait_process_sample_ms(
    kneegait_pipeline_t* pipe,
    uint32_t t_ms,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    return kneegait_process_sample(pipe, (float)t_ms / 1000.0f, knee_flexion, accel_z, out_result);
}

#endif // KNEEGAIT_MODEL_DATA_H
